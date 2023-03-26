$(document).ready(function() {

	var box = document.getElementById('chatBox');
	var ideaBox = document.getElementById('ideaBox');
	alert("To start, type what topic you'd like to explore in the bottom left box");
	// document.getElementById('ideaBox').lastChild.scrollIntoView(true);
	$('#chatInterface').on('submit', function(event) {
		event.preventDefault();

		var txt = $('input[name=testInput]').val(); //get the text from the form

		chatAppend(txt, 0); //0 means human text
		document.getElementById('chatBox').lastChild.scrollIntoView(true);

		var posting = $.post($(this).attr('action'), $(this).serialize()); //http post the request for GPT3 output
		posting.done(function( data ) {
			chatAppend(data, 1); //1 means machine wrote this text
			document.getElementById('chatBox').lastChild.scrollIntoView(true);
		});

		$('#chatInterface').children('#testInput').val(''); // clear chat text box
	});

	$('#ideaSourceForm').on('submit', function(event) {
		event.preventDefault();

		var summaryPost = $.post($(this).attr('action'), $(this).serialize());
		summaryPost.done(function( data ) {
			// alert(data)
			ideaAppend(data);
		});

		$('#ideaSourceForm').children('#ideaSourceText').val(''); 
	});

	$('#topicSelectForm').on('submit', function(event) {
		event.preventDefault();

		var el = document.getElementById('topicSelectText');
		el.style.background = '#e46441'
		el.style.color = '#ffffff'
		el.blur();
		// $('#topicSelectText').prop('disabled', true);
		chatAppend('Hi, how can I help?', 1);
		$('#topicSelectText').blur();


		var topicPost = $.post($(this).attr('action'), $(this).serialize());
		topicPost.done(function( data ) {
			// alert(data)
			ideaAppend(data);
		});

	});

	function chatAppend(text, author){ 
		
		var span = document.createElement('span');

		span.class = "chatSpan";
		if (author == 0){
			span.id = "human";			
		} else if (author == 1){
			span.id = "machine"	;		
		}

		var txt = document.createTextNode(text);
		span.appendChild(txt);
		box.appendChild(span);
	}

	function ideaAppend(text){ 
		const ideaSpan = document.createElement('ideaSpan');
		ideaSpan.id = "tldrSpan";
		ideaSpan.className = "tldrClass"

		const txt = document.createTextNode(text);
		ideaSpan.appendChild(txt);
		ideaBox.appendChild(ideaSpan);
		$( ".tldrClass" ).draggable();
		document.getElementById('ideaBox').lastChild.scrollIntoView(true);

	}

	$('#tldrButton').on('click', function(event) {
		var tldrPost = $.post('/tldr');
		tldrPost.done(function( data ){			
			ideaAppend(data);		
		});
	});

	$('#promptButton').on('click', function(event) {
		var keywordPost = $.post('/keywordGen');
		keywordPost.done(function( data ){			
			ideaAppend(data);		
		});
	});

	$('#resetButton').on('click', function(event) {
		box.replaceChildren();
		$.post('/chatReset');
	});

});