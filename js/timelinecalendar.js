
if( !window.console )
{
	window.console = {
			log : function( msg )
			{
				return;
			}
			
	}
}

var TimelineCalendar = function(element)
{
	var elem = element; // this is a jQuery element
	
	var colwidth = 0,
			header = null,
			entered = false, // mouse is over the calendar
			isResizeAction = false, // detected resize action
			isMoveAction = false, // detected move action
			maxHeight = null, // holds max height, looks better - our cal grows
			gridRow = null;

	var start = new Date();
	start.setHours(0, 0, 0, 0);

	var options = {
		startDate : start,
		zoomLevel : 2,
		interval : 86400, // one day
		itemsMoveable : true, // can the user move the items
		itemsResizeable : true // ... or resize
	};

	var dragStartX = null,
			mouseDownItem=null,
			oldStartX = null;
	var factor = 0;

	var zoomLevels = new Array( 1,2,5,7,14,21,28,40,70,365 );

	this.getZoomLevelOffset = function( level )
	{
		var firstTs = options.startDate.getTime()/1000;
		var ts = zoomLevels[level]*86400+firstTs;
		return ts;
	}
	
	this.create = function()
 	{
		var tl = this;
		
		elem.bind('mouseenter', function(event)
		{
			tl.entered = true;
		});
		elem.bind('mouseleave', function(event) {
			tl.entered = false;
		});

		$(window).bind('keyup', function( event )
			{
				if( tl.entered )
				{
					if( event.which == 39 )
						tl.goFuture();
					else if( event.which == 37 )
						tl.goPast();
					event.preventDefault();
				}
		} );

		elem.bind('mousewheel', function(event, delta)
				{
            		if( delta > 0 )
            			tl.zoomIn();
            		else
            			tl.zoomOut();
            		return false;
				});

		this.draw();
	};
	
	this.drawJsonItems = function(target, items)
	{
		var zero = options.startDate.getTime()/1000;
		for( var x=0; x<items.length; x++ )
		{
			var item = items[x];
			var d = new Date(item.start*1000);
			var leftPos = (item.start-zero)*factor;
			var itemWidth = (item.end-item.start)*factor;

			var d = $("<div/>");
			d.addClass("item");
			if( item.cssclass )
				d.addClass( item.cssclass );
			d.css("left",leftPos+"px");
			d.css("width",itemWidth+"px");
			
			var tl = this;

			// attach event listeners
			d.mouseover( function(event) 
			{
				var pos = $(this).position();
				if( options.itemsResizeable &&
						event.pageX > (pos.left+$(this).width()-5) )
				{
					$("body").addClass("resize");
				}
				else if( options.itemsMoveable )
					$("body").addClass("move");
			} );
			
			d.mouseout( function() {
				$("body").removeClass("resize");
				$("body").removeClass("move");
			} );

			d.mousedown( function( event )
			{
				mouseDownItem = $(this);
				dragStartX = event.pageX;

				var pos = mouseDownItem.position();
				oldStartX = pos.left;
				
				var mouseMoveFunction = null;
				
				if( options.itemsResizeable &&
						event.pageX > (pos.left+mouseDownItem.width()-5) )
				{
					var oldWidth = mouseDownItem.width();
					isResizeAction = true;
					$("body").addClass("resize");
					mouseMoveFunction = function( event )
					{
						var newWidth = oldWidth+(event.pageX-dragStartX);
						if( newWidth < 20 )
							newWidth = 20;
						mouseDownItem.css("width",newWidth+"px");
					};
				}
				else if( options.itemsMoveable )
				{
					isMoveAction = true;
					$("body").addClass("move");
					mouseMoveFunction = function( event )
					{
						if( !mouseDownItem )
						{
							$(window).unbind(this);
							return;
						}
	
						var newLeft = oldStartX+(event.pageX-dragStartX);
						if( newLeft < 0 )
							newLeft = 0;
						
						if( mouseDownItem.width() < elem.width() &&
									(newLeft + mouseDownItem.width() > elem.width() ) )
							newLeft = elem.width()-mouseDownItem.width();
						
						mouseDownItem.css("left", newLeft+"px");
					};
				}

				var mvMouseUp = function( event )
				{
					$(window).unbind('mousemove',mouseMoveFunction);
					$(window).unbind('mouseup',mvMouseUp);
					
					var pos =  mouseDownItem.position();
					var zero = options.startDate.getTime()/1000;
					var start = zero+pos.left/factor;
					var end = start + mouseDownItem.width()/factor;
					event.item = {
							node : mouseDownItem,
							start : parseInt(start), // @todo compute the timestamp
							end : parseInt(end) }; // @todo compute the timestamp
					mouseDownItem = null;
					if( isMoveAction )
						tl.onItemMoved(event);
					else if( isResizeAction )
						tl.onItemResized(event);

					isMoveAction = isResizeAction = false;
					$("body").removeClass("resize");
					$("body").removeClass("move");
				}

				if( mouseMoveFunction )
				{
					$(window).bind("mouseup", mvMouseUp);
					$(window).bind("mousemove", mouseMoveFunction);
				}

				event.preventDefault();
			} );

			d.html(item.data);
			target.append(d);
		}
		
//		console.log( target.height() ); // heigth of datagrid
//		target.css("margin-top", "-"+(target.height())+"px" );
		
		// remind maxheight - this looks better after zooming
		if(elem.height() > maxHeight)
			maxHeight = elem.height();
		//gridRow.css("height",target.parent().height()+"px");
		//gridRow.css("display","table");
		return this;
	}

	this.updateData = function(dataGrid)
	{
		//console.log("factor "+factor);
		var currentDate = options.startDate.getTime()/1000;
		var zoomLevelDays = this.getZoomLevelOffset(options.zoomLevel);
		var tl = this;
		$.getJSON(
			  "stores/fetch_data.php",
			  {
				  start : currentDate,
				  offset : zoomLevelDays
			  },
			  function( data )
			  {
				  tl.drawJsonItems(dataGrid,data);
			  }
			);
	}
	
	this.onItemMoved = function( event )
	{
		console.log("onItemMoved handler "+
					new Date( event.item.start*1000 )+
						" "+new Date( event.item.end*1000 ));
	}
	
	this.onItemResized = function( event )
	{
		console.log("onItemResized handler"+
					new Date( event.item.start*1000 )+
					" "+new Date( event.item.end*1000 ));
	}
	
	this.draw = function()
	{
		var currentDate = options.startDate;
		elem.empty();
		
		
		var container = $("<div>").attr("class","container");
		if( maxHeight )
			container.css("min-height", maxHeight+"px");
		header = $('<div>');
		header.addClass("header");

		var dataGrid = $("<div>");
		dataGrid.attr("class","datagrid");
		var zoomLevelLimit = this.getZoomLevelOffset(options.zoomLevel);
		
		var daysInRow = (zoomLevelLimit-(options.startDate.getTime()/1000))/84600;

		if( daysInRow > 350 )
			options.interval = 86400*30;
		else if( daysInRow > 250 )
			options.interval = 86400*14;
		else if( daysInRow > 70 )
			options.interval = 86400*7;
		else if( daysInRow > 30 )
			options.interval = 86400*2;
		else
			options.interval = 86400;
		
		factor = elem.width()/(zoomLevelLimit-(options.startDate.getTime()/1000));
		this.colWidth = factor*options.interval;

		//gridRow = $("<div>").addClass("grid");
		//gridRow.css("display","none");
		var odd = false;
		for( var x=(options.startDate.getTime()/1000); x < zoomLevelLimit; x+=options.interval )
		{
			odd ^= true;
			currentDate = new Date( x*1000 );
			var td = $("<div>");
			td.addClass("col");
			td.addClass( ( odd ? "odd" : "even" ) );
			td.addClass(currentDate.getDay());
			td.width(this.colWidth+"px");
			td.html(""+currentDate.getDate()+"."+(currentDate.getMonth()+1)+".");
			header.append(td);
			
			/*var gridTd = $("<div>");
			gridTd.width(this.colWidth+"px");
			gridRow.append(gridTd);*/
		}

		container.append(header);
		container.append(gridRow);
		container.append(dataGrid);
		
		this.updateData(dataGrid);
		elem.append(container);

		if( this.onDraw )
			this.onDraw( options );
	}

	this.zoomIn = function()
	{
		var currentLevel = options.zoomLevel;
		var levelIn = currentLevel-1;
		if( zoomLevels[levelIn] )
		{
			options.zoomLevel = levelIn;
			this.draw();
		}
	}
	
	this.zoomOut = function()
	{
		var currentLevel = options.zoomLevel;
		var levelOut = currentLevel+1;
		if( zoomLevels[levelOut] )
		{
			options.zoomLevel = levelOut;
			this.draw();
		}
	}

	this.goPast = function()
	{
		var tmp = (options.startDate.getTime()/1000)-((this.getZoomLevelOffset(options.zoomLevel)-(options.startDate.getTime()/1000))/2);
		options.startDate = new Date( tmp*1000 );
		this.draw();
	}

	this.goFuture = function()
	{
		var tmp = (options.startDate.getTime()/1000)+(this.getZoomLevelOffset(options.zoomLevel)-(options.startDate.getTime()/1000))/2;
		options.startDate = new Date( tmp*1000 );
		this.draw();
	}
	
};
