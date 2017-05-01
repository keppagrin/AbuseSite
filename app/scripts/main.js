(function() {


	var buttonHeight = $('#show-flags').height();

	var showButton = document.getElementById('show-flags');

	var open = false;

	$('#show-flags').mouseenter(function(){
		$(this).animate({
			height: '60'
		},{ queue: false });
		$(this).animate({
			'line-height':'60' 
		},{ queue: false });
	}).mouseleave(function(){
		$(this).animate({
			height: buttonHeight
		},{ queue: false });
		$(this).animate({
			'line-height':buttonHeight
		},{ queue: false });
		$('.source').fadeOut();
		open = false;
	});

	showButton.addEventListener('click', buttonClick, false);

	function buttonClick(e){
		if(open==true){
			//nothing
		}
		else{
			open = true;
			console.log('clicky');
			$(this).animate({
				height: '250'
			},{ queue: false });
			$(this).animate({
				'line-height':'40' 
			},{ queue: false });
			$(this)
				.append('<p class="source"><a href="http://www.ncadv.org/learn-more/what-is-domestic-violence/abusive-partner-signs"><span class="small">[flags]</span> National Coalition Against Domestic Violence</a></p><p class="source"><a href="https://www.helpguide.org/articles/abuse/domestic-violence-and-abuse.htm"><span class="small">[2] </span>Understanding Domestic Violence</a></p><p class="source"><a href="https://www.thefword.org.uk/2012/12/i_married_chris/"><span class="small">[3] </span><span class="italic">&quot;I married Christian Grey&quot;</span></span></a></p><span class="small"><p class="source black">50 Shades of Grey written by EL James (2011)</p></span>');
		}
	}

	//Book stuff
	
	// Dimensions of the whole book
	var BOOK_WIDTH = 830;
	var BOOK_HEIGHT = 560;
	
	// Dimensions of one page in the book
	var PAGE_WIDTH = 400;
	var PAGE_HEIGHT = 550;
	
	// Vertical spacing between the top edge of the book and the papers
	var PAGE_Y = ( BOOK_HEIGHT - PAGE_HEIGHT ) / 2;
	
	// The canvas size equals to the book dimensions + this padding
	var CANVAS_PADDING = 60;
	
	var page = 0;
	
	var canvas = document.getElementById( 'pageflip-canvas' );
	var context = canvas.getContext( '2d' );
	
	var mouse = { x: 0, y: 0 };
	
	var flips = [];
	
	var book = document.getElementById( 'book' );
	
	// List of all the page elements in the DOM
	var pages = book.getElementsByTagName( 'section' );
	
	// Organize the depth of our pages and create the flip definitions
	for( var i = 0, len = pages.length; i < len; i++ ) {
		pages[i].style.zIndex = len - i;
		
		flips.push( {
			// Current progress of the flip (left -1 to right +1)
			progress: 1,
			// The target value towards which progress is always moving
			target: 1,
			// The page DOM element related to this flip
			page: pages[i], 
			// True while the page is being dragged
			dragging: false
		} );
	}
	
	// Resize the canvas to match the book size
	canvas.width = BOOK_WIDTH + ( CANVAS_PADDING * 2 );
	canvas.height = BOOK_HEIGHT + ( CANVAS_PADDING * 2 );
	
	// Offset the canvas so that it's padding is evenly spread around the book
	canvas.style.top = -CANVAS_PADDING + 'px';
	canvas.style.left = -CANVAS_PADDING + 'px';
	
	// Render the page flip 60 times a second
	setInterval( render, 1000 / 60 );
	
	document.addEventListener( 'mousemove', mouseMoveHandler, false );
	document.addEventListener( 'mousedown', mouseDownHandler, false );
	document.addEventListener( 'mouseup', mouseUpHandler, false );
	
	function mouseMoveHandler( event ) {
		// Offset mouse position so that the top of the book spine is 0,0
		mouse.x = event.clientX - book.offsetLeft - ( BOOK_WIDTH / 2 );
		mouse.y = event.clientY - book.offsetTop;
	}
	
	function mouseDownHandler( event ) {
		// Make sure the mouse pointer is inside of the book
		if (Math.abs(mouse.x) < PAGE_WIDTH) {
			if (mouse.x < 0 && page - 1 >= 0) {
				// We are on the left side, drag the previous page
				flips[page - 1].dragging = true;
				console.log('flip back');
			}
			else if (mouse.x > 0 && page + 1 < flips.length) {
				// We are on the right side, drag the current page
				flips[page].dragging = true;
			}
		}
		
		// Prevents the text selection
		event.preventDefault();
	}
	
	function mouseUpHandler( event ) {
		for( var i = 0; i < flips.length; i++ ) {
			// If this flip was being dragged, animate to its destination
			if( flips[i].dragging ) {
				// Figure out which page we should navigate to
				if( mouse.x < 0 ) {
					flips[i].target = -1;
					page = Math.min( page + 1, flips.length );
				}
				else {
					flips[i].target = 1;
					page = Math.max( page - 1, 0 );
				}
				hideFlags();
				showFlags(page);
			}
			
			flips[i].dragging = false;
		}
		

	}
	
	function render() {
		// Reset all pixels in the canvas
		context.clearRect( 0, 0, canvas.width, canvas.height );
		
		for( var i = 0, len = flips.length; i < len; i++ ) {
			var flip = flips[i];
			
			if( flip.dragging ) {
				flip.target = Math.max( Math.min( mouse.x / PAGE_WIDTH, 1 ), -1 );
			}
			
			// Ease progress towards the target value 
			flip.progress += ( flip.target - flip.progress ) * 0.2;
			
			// If the flip is being dragged or is somewhere in the middle of the book, render it
			if( flip.dragging || Math.abs( flip.progress ) < 0.997 ) {
				drawFlip( flip );
			}	
		}
	}
	
	function drawFlip( flip ) {
		// Strength of the fold is strongest in the middle of the book
		var strength = 1 - Math.abs( flip.progress );
		
		// Width of the folded paper
		var foldWidth = ( PAGE_WIDTH * 0.5 ) * ( 1 - flip.progress );
		
		// X position of the folded paper
		var foldX = PAGE_WIDTH * flip.progress + foldWidth;
		
		// How far the page should outdent vertically due to perspective
		var verticalOutdent = 20 * strength;
		
		// The maximum width of the left and right side shadows
		var paperShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( 1 - flip.progress, 0.5 ), 0 );
		var rightShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		var leftShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		
		
		// Change page element width to match the x position of the fold
		flip.page.style.width = Math.max(foldX, 0) + 'px';
		
		context.save();
		context.translate( CANVAS_PADDING + ( BOOK_WIDTH / 2 ), PAGE_Y + CANVAS_PADDING );
		
		
		// Draw a sharp shadow on the left side of the page
		context.strokeStyle = 'rgba(0,0,0,'+(0.05 * strength)+')';
		context.lineWidth = 30 * strength;
		context.beginPath();
		context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT + (verticalOutdent * 0.5));
		context.stroke();
		
		
		// Right side drop shadow
		var rightShadowGradient = context.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
		rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
		rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');
		
		context.fillStyle = rightShadowGradient;
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX + rightShadowWidth, 0);
		context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
		context.lineTo(foldX, PAGE_HEIGHT);
		context.fill();
		
		
		// Left side drop shadow
		var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
		leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
		leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');
		
		context.fillStyle = leftShadowGradient;
		context.beginPath();
		context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
		context.lineTo(foldX - foldWidth, 0);
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
		context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
		context.fill();
		
		
		// Gradient applied to the folded paper (highlights & shadows)
		var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
		foldGradient.addColorStop(0.35, '#fafafa');
		foldGradient.addColorStop(0.73, '#eeeeee');
		foldGradient.addColorStop(0.9, '#fafafa');
		foldGradient.addColorStop(1.0, '#e2e2e2');
		
		context.fillStyle = foldGradient;
		context.strokeStyle = 'rgba(0,0,0,0.06)';
		context.lineWidth = 0.5;
		
		// Draw the folded piece of paper
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX, PAGE_HEIGHT);
		context.quadraticCurveTo(foldX, PAGE_HEIGHT + (verticalOutdent * 2), foldX - foldWidth, PAGE_HEIGHT + verticalOutdent);
		context.lineTo(foldX - foldWidth, -verticalOutdent);
		context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);
		
		context.fill();
		context.stroke();
		
		
		context.restore();
	}
	
})();

function showFlags(page){
	hideFlags();
	switch(page){
		case 0:
			console.log('is 0');
			break;
		case 1:
			console.log('showing page 1 flags');
			$('#pages').append('<span class="flag one animation-target"><b>Extremely controlling behavior</b><br/></span>');
			
			var top = $('.flagholder.one').position().top;
			//console.log(top);
			var left = $('.flagholder.one').position().left;
			left += 50;
			$('.flag.one').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag two animation-target">Unpredictability</span>');
			
			var top = $('.flagholder.two').position().top;
			//console.log(top);
			var left = $('.flagholder.two').position().left;
			left += 150;
			$('.flag.two').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag three animation-target">Possessiveness</span>');
			
			var top = $('.flagholder.three').position().top;
			//console.log(top);
			var left = $('.flagholder.three').position().left;
			left += 150;
			$('.flag.three').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag four animation-target">Extreme jealousy</span>');
			
			var top = $('.flagholder.four').position().top;
			//console.log(top);
			var left = $('.flagholder.four').position().left;
			left += 70;
			$('.flag.four').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag five animation-target">Unpredictability</span>');
			
			var top = $('.flagholder.five').position().top;
			//console.log(top);
			var left = $('.flagholder.five').position().left;
			left += 150;
			$('.flag.five').css({
				top: top+'px',
				left: left+'px'
			});
			
			break;
		case 2:
			console.log('is 2');

			$('#pages').append('<span class="flag six animation-target">Possessiveness</span>');
			
			var top = $('.flagholder.six').position().top;
			//console.log(top);
			var left = $('.flagholder.six').position().left;
			left += 150;
			$('.flag.six').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag seven animation-target">Extremely controlling behavior</span>');
			
			var top = $('.flagholder.seven').position().top;
			//console.log(top);
			var left = $('.flagholder.seven').position().left;
			left += 50;
			$('.flag.seven').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag eight animation-target">Extremely controlling behavior</span>');
			
			var top = $('.flagholder.eight').position().top;
			//console.log(top);
			var left = $('.flagholder.eight').position().left;
			left += 50;
			$('.flag.eight').css({
				top: top+'px',
				left: left+'px'
			});

			break;

		case 3:

			$('#pages').append('<span class="flag nine animation-target">Bad temper</span>');
			
			var top = $('.flagholder.nine').position().top;
			//console.log(top);
			var left = $('.flagholder.nine').position().left;
			left += 150;
			$('.flag.nine').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag ten animation-target">People who are being abused may show signs of depression or anxiety</span>');
			
			var top = $('.flagholder.ten').position().top;
			//console.log(top);
			var left = $('.flagholder.ten').position().left;
			left += 85;
			$('.flag.ten').css({
				top: top+'px',
				left: left+'px'
			});

			break;

		case 4:

			$('#pages').append('<span class="flag eleven animation-target">People who are being abused may show major personality changes</span>');
			
			var top = $('.flagholder.eleven').position().top;
			//console.log(top);
			var left = $('.flagholder.eleven').position().left;
			left += 80;
			$('.flag.eleven').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag twelve animation-target">Abuse victims may have very low self-esteem, even if they used to be confident</span>');
			
			var top = $('.flagholder.twelve').position().top;
			//console.log(top);
			var left = $('.flagholder.twelve').position().left;
			left += 45;
			$('.flag.twelve').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag thirteen animation-target">Abusers may demand their partner check in frequently and report where they are and what they are doing.</span>');
			
			var top = $('.flagholder.thirteen').position().top;
			//console.log(top);
			var left = $('.flagholder.thirteen').position().left;
			left += 45;
			$('.flag.thirteen').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag fourteen animation-target">Fear/anxiety associated with abuser</span>');
			
			var top = $('.flagholder.fourteen').position().top;
			//console.log(top);
			var left = $('.flagholder.fourteen').position().left;
			left += 45;
			$('.flag.fourteen').css({
				top: top+'px',
				left: left+'px'
			});

			$('#pages').append('<span class="flag fifteen animation-target">Threats of violence</span>');
			
			var top = $('.flagholder.fifteen').position().top;
			//console.log(top);
			var left = $('.flagholder.fifteen').position().left;
			left += 45;
			$('.flag.fifteen').css({
				top: top+'px',
				left: left+'px'
			});

			break;
	}
}

function hideFlags(){
	$('.flag').remove();
}

/*
(function() {

	var BOOK_WIDTH = 830;
	var BOOK_HEIGHT = 560;

	var PAGE_WIDTH = 400;
	var PAGE_HEIGHT = 550;

	var PAGE_Y = ( BOOK_HEIGHT - PAGE_HEIGHT ) / 2;

	var CANVAS_PADDING = 60;

	var page = 0;

	var canvas = document.getElementById("pageflip-canvas");
	var context = canvas.getContext( "2d" );

	var mouse = { x: 0, y: 0 };

	var flips = [];

	var book = document.getElementById( "book" );

	//List all pages
	var pages = book.getElementsByTagName( "section" );

	//Organize pages, create flip definitions
	for ( var i = 0, len = pages.length; i < len; i++ ) {
		pages[i].style.zIndex = len - i;

		flips.push( {
			progress: 1,
			target: 1,
			page: pages[i],
			dragging: false
		});
	}

	canvas.width = BOOK_WIDTH + ( CANVAS_PADDING * 2 );
	canvas.height = BOOK_HEIGHT + (CANVAS_PADDING * 2 );

	canvas.style.top = -CANVAS_PADDING + "px";
	canvas.style.left = -CANVAS_PADDING + "px";

	setInterval( render, 1000/60 );

	document.addEventListener( "mousemove", mouseMoveHandler, false );
	document.addEventListener( "mousedown", mouseDownHandler, false );
	document.addEventListener( "mouseup", mouseUpHandler, false );


	function mouseMoveHandler( event ) {
		mouse.x = event.clientX - book.offsetLeft - ( BOOK_WIDTH / 2 );
		mouse.y = event.clientY - book.offsetTop;
	}

	function mouseDownHandler( event ) {
		if (Math.abs(mouse.x) < PAGE_WIDTH) {
			if (mouse.x < 0 && page - 1 >= 0) {
				//We are on left side, going back in pages
				flips[page - 1].dragging = true;
			}
			else if (mouse.x > 0 && page + 1 < flips.length) {
				//We are on right side, moving forward
				flips[page].dragging = true;
			}
		}

		//Prevent text selection
		event.preventDefault();
	}

	function mouseUpHandler( event ) {
		for( var i = 0; i < flips.length; i++ ) {
			if( flips[i].dragging ) {
				if( mouse.x < 0 ) {
					flips[i].target = -1;
					page = Math.min( page + 1, flips.length );
				}
				else {
					flips[i].target = 1;
					page = Math.max( page - 1, 0 );
				}
			}

			flips[i].dragging = false;
		}
	}


	function render() {
		//Reset all pixels in the canvas
		context.clearRect( 0, 0, canvas.width, canvas.height );

		for( var i = 0, len = flips.length; i < len; i++ ){
			var flip = flips[i];

			if( flip.dragging ) {
				flip.target = Math.max( Math.min( mouse.x / PAGE_WIDTH, 1 ), -1);
			}

			//Ease movement
			flip.progress += ( flip.target - flip.progress ) * 0.2;

			if( flip.dragging || Math.abs( flip.progress ) < 0.997 ) {
				drawFlip( flip );
			}
		}
	}

	function drawFlip( flip ) {
		var strength = 1 - Math.abs( flip.progress );

		var foldWidth = ( PAGE_WIDTH * 0.5 ) * ( 1 - flip.progress );

		var foldX = PAGE_WIDTH * flip.progress + foldWidth;

		var verticalOutdent = 20 * strength;

		var paperShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( 1 - flip.progress, 0.5 ), 0 );
		var rightShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		var leftShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );

		flip.page.style.width = Math.max(foldX, 0) + "px";

		context.save();
		context.translate( CANVAS_PADDING + ( BOOK_WIDTH / 2 ), PAGE_Y + CANVAS_PADDING );

		//Sharp shadow on left side of page
		context.strokeStyle = 'rgba(0,0,0,'+(0.05*strength)+')';
		context.lineWidth = 30 * strength;
		context.beginPath();
		context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5 );
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT + (verticalOutdent * 0.5));
		context.stroke();

		//Right side drop shadow
		var foldHolder = foldX + rightShadowWidth
		var rightShadowGradient = context.createLinearGradient(foldX, 0, foldHolder, 0);
		rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
		rightShadowGradient.addColorStop(0.8,'rgba(0,0,0,0.0)');

		context.fillStyle = rightShadowGradient;
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX + rightShadowWidth, 0);
		context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
		context.lineTo(foldX, PAGE_HEIGHT);
		context.fill();

		//Left side drop shadow
		var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
		leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
		leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');

			context.fillStyle = leftShadowGradient;
			context.beginPath();
			context.moveTo(foldX - foldWidth - leftShadowWidth, 0);
			context.lineTo(foldX - foldWidth, 0);
			context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
			context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
			context.fill();

			// Gradient applied to folded paper (highlights & shadows)
			var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
			foldGradient.addColorStop(0.35, '#fafafa');
			foldGradient.addColorStop(0.73, '#eeeeee');
			foldGradient.addColorStop(0.9, '#fafafa');
			foldGradient.addColorStop(1.0, '#e2e2e2');
			context.fillStyle = foldGradient;
			context.strokeStyle = 'rgba(0,0,0,0.06)';
			context.lineWidth = 0.5;

			//draw the thing!!
			context.beginPath();
			context.moveTo(foldX, 0);
			context.lineTo(foldX, PAGE_HEIGHT);
			context.quadraticCurveTo(foldX, PAGE_HEIGHT + (verticalOutdent * 2), foldX - foldWidth, PAGE_HEIGHT + verticalOutdent);
			context.lineTo(foldX - foldWidth, -verticalOutdent);
			context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);

			context.fill();
			context.stroke();

			context.restore();
		}
})();
*/