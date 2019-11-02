(function ( $ ) {
				
	var _html = $('html');
	var _body = $('body');
	var _docu = $(document);
	var _cont = $('<div />',{class:'slikes'});
	var _file = 'action.php';
	var _fbpg = 'http://www.facebook.com/sharer/sharer.php?u=';
	var _twpg = 'https://twitter.com/intent/tweet?text=Keyword+Grouper+Pro%3A+Quickly+Group+All+Your+Keywords&url=';
	var _glpg = 'https://plus.google.com/share?url=';
	
	$.fn.slikes = function(options) {
		
		var defaults = {
			url : 'http://google.com/'	
		};
		
		$.extend( true, defaults, options );
		
		ito = $(this);
		
		$.ajax({
			url : _file+'?getcounter=1',
			dataType : 'json',
			success : function(data){
				ito.find('div').each(function(i,x){
					type = $(x).data('type');
					cnt = 0;
					for(x=0;x<data.length;x++){
						if( type == data[x].type){
							cnt = data[x].count;
						}
					}
					btn = $('<a />',{
						class : type +'-button slikes-button-default'	
					})
					.attr('data-type',type)
					.attr('data-count',cnt);
					_cont.append(btn.html('<span class="icon"></span><span class="count">'+cnt+'</span>'));
				});
				
				_body.prepend(_cont);
				
				_cont.css( {
					"top" 		: 'calc(50% - '+(_cont.height()/2)+'px)',
					"marginLeft":"-" + _body.css('marginLeft')						
				});
				
				ito.remove();
			},
			error: function(){
				
			}
		});
		
		_cont.on('click','.slikes-button-default',function(e){
			e.preventDefault();
			btn = $(this);
			type = btn.data('type');
			count= btn.data('count');
			
			if(!btn.hasClass('clicked')){
				btn.addClass('clicked');
				$.ajax({
					url : _file+'?addcounter=1&type='+type,
					dataType : 'json',	
					async:    false,
					success : function(data){
						count = parseInt(count)+1;
						btn.data('count',(count));
						btn.find('span.count').text(count);
						btn.removeClass('clicked');
						
						if(type=='facebook'){
							openUrl = _fbpg + encodeURIComponent(defaults.url);	
						}else if(type=='twitter'){
							openUrl = _twpg + encodeURIComponent(defaults.url);		
						}else{
							openUrl = _glpg + encodeURIComponent(defaults.url);	
						}
						window.open(openUrl);
					},
					error:function(){
						btn.removeClass('clicked');
					}
				});
			}
			
		});
		
	};
	
	
}( jQuery ));