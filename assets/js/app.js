$(document).ready(function() {

    var App = {

		// Initialize all needed variables and events for application
        init: function() {

			//  Save each elements in variables.
			App.$body			= $('body');
            App.$results 		= $('#results');
			App.$resultsValue	= [];
			App.$processBtn 	= $('button.js-process-btn');
			App.$excludeBtn 	= $('button.js-exclude-btn');
			App.$maxLength 		= $('#maxLength');
			App.$groupUL 		= $('div#groups #menu1 ul.list-group');
			App.$groupULless	= $('div#groups #menu2 ul.list-group');
			App.$btnProcess		= $('button.js-process-btn');
			App.$phraseProgress = $('#keyword-progress');
			App.$phraseBar 		= App.$phraseProgress.find('.progress-bar');
			App.$keywordMessage = $('#keyword-progress .progressMessage');
			App.$groups			= $('div#groups');
			App.$excludedText	= $('#excluded');
			App.$excludeModal	= $('#ExcludeModal');
			App.$succProcessKWord = $('.success-process-keywords');
			App.$succProcessGrp = $('#success-process-groups')
			App.$succProcessGrpL= $('#success-process-groupsL');

			// default html and counting for keywords
			App.HigherHTML 		= "";
			App.LowerHTML 		= "";
			App.HighCount 		= 0;
			App.LowCount		= 0;
			App.start 			= 0;
			App.chunkedCount	= 1000;

			// Default values used in processing the results in grouping
			App.gnrtdKeywords 	= [];
			App.expandedKeywords= [];
			App.finalGroups		= [];
			App.phrasesTaken 	= [];
			App.generated		= [];
			App.chunked			= [];
			App.newGenerated	= [];
			App.csvArray		= [];

			// Register events
			App.$btnProcess.click(App.clickBtnProcess);
			App.$excludeBtn.click(function(){App.$excludeModal.modal('hide')});
			// Event delegate. Copty to clipboard buttons are not yet present on load
			App.$groups.on('click','button.copy-result-btn',App.clickCopyClipboard);

			// set default value for excluded words	textarea
			App.$excludedText.val(stopWords.join('\n'));

        },

		// Process the keyword matching
		clickBtnProcess: function(e) {

			// Stop the form from submiting
			e.preventDefault();

			if( parseInt(App.$maxLength.val()) ){

				// used in calculating the speed of the script
				App.start = new Date().getTime();

				// cache the results in a variable
				App.$resultsValue = App.$results.val().split("\n");

				// remove the form
				$('#processForm').remove();

				// show progress bar
				App.$phraseProgress.show();
				App.$phraseBar.width(0);

				//Generate clean keywords
				App.$keywordMessage.text( "Чистка ключевых слов..." );
				stopWords = App.$excludedText.val().split("\n");
				App.generateCleanKeywords();

				//console.log(App.gnrtdKeywords);
				App.generated = App.gnrtdKeywords;
				// Expand keywords and remove duplicates
				App.$keywordMessage.text( "Расширение ключевых слов..." );
				setTimeout(function(){ // add a delay so that script won't crash
					App.expandKeywordsNoDuplicates();

					// sort by expanded keywords by number of words
					App.expandedKeywords.sort(function(a,b){
						if( a.count == b.count ){
							return (a.keyword < b.keyword) ? -1 : (a.keyword > b.keyword) ? 1 : 0;
						}
						return b.count - a.count;
					});

					App.$keywordMessage.text( "Подготовка ключевых слов..." );

					// start the matching
					setTimeout(function(){ // add a delay so that script won't crash
						App.newGenerated = App.gnrtdKeywords;
						App.chunked = App.array_chunk( App.expandedKeywords );
						App.chunkAndMatch( 0 );
					},20);

				},10);

			}

		},

		// chunk parts of the expanded keywords and start to loop through each chunk parts
		chunkAndMatch: function( index ){

			// check if index is existing inside the chunked parts
			if( App.chunked.length > index ){
				// if it's inside start to process the chunk parts
				App.matchTopToBottom( App.chunked[ index ] , index );
				// call the next chunk part to be processed
				setTimeout(function(){ // add delay so that script wont crash
					App.chunkAndMatch( index + 1 );
				},100);
			}else{
				// sort final groups based on count and count is equal sort by the keyword
				App.finalGroups.sort(function(a,b){
					if( b.count == a.count ){
						return (a.keyword < b.keyword) ? -1 : (a.keyword > b.keyword) ? 1 : 0;
					}
					return b.count - a.count;
				});
				// process the no group list
				App.noGroupList();
				// show the group list and no group list
				App.processView(0);
			}

		},

		// Generates the clean keywords
		generateCleanKeywords: function(){

			// iterate each values in the result textarea
			//$.each(App.$resultsValue,function(index,value){
			len = App.$resultsValue.length;
			for(index=0;index<len;index++){
				// Remove first all excluded word from phrase before adding to the generated keyword list
				value = App.$resultsValue[index];
				clean = App.cleanKeyword(value).join(" ");
				App.gnrtdKeywords.push({
					original : value,
					clean : clean,
					keywords : [],
					count : 0
				});
			//});
			}

		},

		// Expands all clean keywords to form a compilation of possible keywords to match
		expandKeywordsNoDuplicates: function(){
			// temporary variable
			temp = [];
			// iterate through the generated keyword list
			len = App.gnrtdKeywords.length;
			for(index=0;index<len;index++){
				object = App.gnrtdKeywords[ index ];
				// get all possible sequences in the phrase
				seq = App.phraseSequence(object.clean); // returns an array of words/phrases
				// iterate through each sequence
				//$.each(seq,function(i,str){
					seqlen = seq.length;
				for(i=0;i<seqlen;i++){
					str = seq[ i ];
					// checks if the sequence is already inside the temporary variable
					if( !App.in_array( str , temp ) ){
						// since it not yet inside.  Let's put it inside the temp variable
						// so that in the succeding item it won't be added anymore
						temp.push( str );
						// add to expanded keyword list
						App.expandedKeywords.push( {
							keyword : str,
							count   : str.split(" ").length
						} );
					}
				//});
				}
			//});
			}

			// let's determine how many chunks will the script operate every iteration
			chunkpercentage = App.expandedKeywords.length * .2; // expanded keywords 20%
			if( chunkpercentage > App.chunkedCount ){ // base is 1000 and if its greate
				App.chunkedCount = parseInt(chunkpercentage * .01); // get its 1% now
			}
		},

		// The matching process
		matchTopToBottom: function( expanded , chunkindex ){

			// iterate through the expanded keyword list
			len = expanded.length;
			for(eindex=0;eindex<len;eindex++){
				keyword = expanded[ eindex ];
				// progress bar width
				width = ( ( (eindex + 1 + (chunkindex*App.chunkedCount) ) / App.expandedKeywords.length) * 100 );
				App.$keywordMessage.text( (eindex + 1 + (chunkindex*App.chunkedCount) ) + ' ключевых слов проанализировано из ' + App.expandedKeywords.length);
				App.$phraseBar.width( width + '%' );

				// we start always on a blank phrase list and clean word
				phrases = [];
				cleanWord = '';
				deleteIndex = -1;
				$break = false;
				// iterate through the generated keyword list
				genlen = App.newGenerated.length;
				for(cindex=0;cindex<genlen;cindex++){

					if( typeof( App.newGenerated[ cindex ] ) == 'undefined' ){
						break;
					}

					clean = App.newGenerated[ cindex ];
					// let's add spaces before and after the clean word
					str = " "+ clean.clean +" ";
					// checks if the clean keyword is inside the expanded keyword and is not null/empty
					// add th the phrases list if its true
					if(
						str.indexOf( " "+keyword.keyword+" " ) > -1 &&
						!App.in_array( clean.original , App.phrasesTaken )
						&& $.trim(clean.clean)
					) {
						phrases.push( clean.original );
						cleanWord = clean.clean;
						deleteIndex = cindex;
					}
				//});
				}

				// checks if the collected phrases count is greater or equal to the length from the users input
				if( phrases.length >= parseInt( App.$maxLength.val() ) ){
					//  add phrases to reserved
					App.phrasesTaken = App.phrasesTaken.concat( phrases );
					searchedIndex = -1;
					finlen = App.finalGroups.length;
					for(x=0;x<finlen;x++){
						if( App.finalGroups[ x ].keyword == keyword.keyword ){
							searchedIndex = x;
							break;
						}
					}
					if( searchedIndex >= 0 ){
						phrases = App.finalGroups[ searchedIndex ].phrases.concat(phrases);
						App.finalGroups[ searchedIndex ] = {
							keyword : keyword.keyword,
							phrases : phrases,
							count : phrases.length,
							type  : 'grouped'
						};
					}else{
						App.finalGroups.push({
							keyword : keyword.keyword,
							phrases : phrases,
							count : phrases.length,
							type  : 'grouped'
						});
					}
					App.generated.splice(deleteIndex, 1);
					//delete App.generated[ deleteIndex ];
				}else{
					//grouped
				}

			//});
			}

			// Sort the final groups based on count and keyword name

		},

		// Generates the no group list
		noGroupList: function(){
			// iterate each values in the result textarea
			reslen = App.$resultsValue.length;
			for(index=0;index<reslen;index++){
				phrase = App.$resultsValue[ index ];
				// check if phrase is already taken from the list.
				// add in the final group list with a flag with no group if it's true
				if( !App.in_array(phrase,App.phrasesTaken) ){
					App.finalGroups.push({
						keyword : '',
						phrases : [phrase],
						type  : 'notgrouped'
					});
				}
			}
		},

		// Process the view for the user
		processView: function( index ){

			// checks if the passed index is existing in the final group list
			if( App.finalGroups.length > index ){
				// add to the higher list HTML and increment the high count
				if(App.finalGroups[ index ].type == 'grouped' ){
					App.appendToHigher( App.finalGroups[ index ] );
					App.HighCount++;
				}
				// add to the lower list HTML and increment the high count
				else if(App.finalGroups[ index ].type == 'notgrouped'){
					App.appendToLower( App.finalGroups[ index ] );
					App.LowCount++;
				}

				// Go to the next final group item
				setTimeout(function(){
					App.processView(index+1);
				},1);

			}else{

				// titles and success messages on each tabs
				App.$succProcessKWord.html('<b>'+App.expandedKeywords.length+'</b> ключевых слов проанализировано');
				App.$succProcessGrp.html('<b>'+App.HighCount+'</b> групп создано с уровнем совпадения от <b>'+App.$maxLength.val()+'</b> слов ' +
					' <a id="exportAsCsv">Экспорт в .csv</a>');
				App.$succProcessGrpL.html('<b>'+App.LowCount+'</b> групп создано, точность - <b>'+App.$maxLength.val()+'</b>');

				// set the html from the generated HTML for each higher and lower group HTMLs
				App.$groupUL.html( App.HigherHTML );
				App.$groupULless.html(
					'<li class="list-group-item col-sm-12">' +
						'<div>' +
							App.LowerHTML +
						'</div>' +
						'<button class="btn btn-success copy-result-btn">Скопировать</button>' +
					'</li>'
				);

				// Set texts on the tabs
				$('#list1').html(App.$maxLength.val()+' слов');
				$('#list2').html('менее чем '+App.$maxLength.val());

				//show the results list
				$('#process-result-list').show();

				// hide the progress bar
				App.$phraseProgress.hide();
				App.$phraseBar.width(0);
				App.createCSVdownload( App.csvArray );
				console.log( (new Date().getTime() - App.start) / 1000  );
			}

		},

		// Appends/Adds the item below the higher HTML
		appendToHigher: function( obj ){
			App.HigherHTML += '<li class="list-group-item col-sm-6" data-keyword="'+obj.keyword+'">';
			App.HigherHTML += '<p><strong>'+obj.keyword+' ('+obj.count+')</strong></p>';
			App.HigherHTML += '<div class="result-phrases">';

			App.csvArray.push([obj.keyword+' ('+obj.count+')',""]);
			for(x=0;x<obj.phrases.length;x++){
				App.HigherHTML += '<div>'+obj.phrases[x]+'</div>';
				App.csvArray.push(["",obj.phrases[x]]);
			}
			App.HigherHTML += '</div>';
			App.HigherHTML += '<button class="btn btn-success copy-result-btn">Скопировать</button>';
			App.HigherHTML += '</li>';

		},

		// Appends/Adds the item below the lower HTML
		appendToLower : function( obj ){
			for(x=0;x<obj.phrases.length;x++){
				App.LowerHTML += '<div>'+obj.phrases[x]+'</div>';
			}
		},

		// Copy to clipboard
		clickCopyClipboard: function(e){
			// prevent form submission
			e.preventDefault();
			btn = $(this);
			str = '';
			// iterate through the nearest list of the current clicked button
			$.each(btn.prev().find('div'),function(i,p){
				if($.trim($(p).text())){
					str += $.trim($(p).text()) + "\n";
				}
			});

			// send items to the clipboad
			App.sendToClipboard(str);
			// restarts all copy to clipboard button to the default.
			$('button.copy-result-btn').text("Скопировать");
			// Change the text of the clicked button
			btn.text('Скопировать');
		},

		// Exclude button.  Just close the modal. no process needed
		clickBtnExclude: function(e){
			e.preventDefault();
			$(this).closest('.modal').modal('hide');
		},

		// Send to clipboard
		sendToClipboard: function(str) {
			// create a textarea.  It will be used where we will put the strings collected
			hiddeninput = $("<textarea></textarea>");
			// append the textarea to the body
			$("body").append(hiddeninput);
			// set the value of the textarea and select/focus inside
			hiddeninput.val(str).select();
			// native JavaScript to create a ctrl+c action
			document.execCommand("copy");
			//remove the textarea
			hiddeninput.remove();
		},

		// Clean the phrase/keyword passed
		// returns the clean phrase/keyword
		cleanKeyword: function( phrase ){

			// iterate through the excluded words list
			for(x=0;x<stopWords.length;x++){
				expr = " "+stopWords[x]+" ";
				phrase = " " + $.trim(phrase) + " ";
				phrase = phrase.replace(expr," ");
			}

			//return $.trim(phrase).split(" ");
			words = phrase.split(" ");
			clean = [];

			for(x=0;x<words.length;x++){

				if( words[x].length >=3 ){

					if(!App.in_array(words[x],stopWords)){

						clean.push(words[x]);

					}

				}

			}

			return clean;
		},

		// Creates a sequence from the phrases
		phraseSequence: function( phrase ){

			// default returned array
			ret = [];
			// split the phrase
			parts = phrase.split(" ");

			// lets iterate through the parts ot the phrase
			// result will be starting from 1st word. then adds second word and so on and so forth...
			for( a = 1 ; a <= parts.length ; a++ ){

				// iterate again through the parts of the phrases. to get the second next word.
				for( x = 0 ; x < parts.length ; x++ ){

					coll = [];

					for( y = x ; coll.length!=a ; y++ ){

						if( typeof(parts[y]) != 'undefined' ){

							coll.push(parts[y]);

						}else{

							break;

						}

					}

					if(coll.length==a){
						ret.push( coll.join(' ') );
					}

				}

			}

			return ret;

		},

		// Function that Iterates a given array list and returns true or false if the given word is int the list.
		in_array : function(needle, haystack) {
			var length = haystack.length;
			$break = false;
			for(var i = 0; i < length; i++) {
				if(haystack[i] == needle) {$break = true;break;}
			}
			return $break;
		},

		// chunk parts to a smaller size
		array_chunk: function( array ){
			var i,j,temparray = [],chunk = App.chunkedCount;
			for (i=0,j=array.length; i<j; i+=chunk) {
				temparray.push(array.slice(i,i+chunk));
			}
			return temparray;
		},

		// create a csv data to be appended.
		createCSVdownload: function( content ){
			// temporary variable for all
			var finalVal = '';
			// iterate through the array of csv rows
			for (var i = 0; i < content.length; i++) {
				var value = content[i];
				// iterate through the columns every row
				for (var j = 0; j < value.length; j++) {
					// set value as blank if it's blank
					var innerValue =  value[j]===null?'':value[j].toString();
					// replace double quotes by single quotes
					var result = innerValue.replace(/"/g, '""');
					// escape double quotes or commas or next lines
					// so that it will only be on a single cell
					if (result.search(/("|,|\n)/g) >= 0)
						result = '"' + result + '"';
					// append a comma to the end of the string if its greater than 0
					if (j > 0)
						finalVal += ',';
					// add result to the final string
					finalVal += result;
				}
				// adds a next line to the final string
				finalVal += '\n';
			}

			// Let's modify the download link
			App.$body.find('#exportAsCsv').attr('href','data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(finalVal));
			App.$body.find('#exportAsCsv').attr('download','groups.csv');

		}

    };

    App.init();

});