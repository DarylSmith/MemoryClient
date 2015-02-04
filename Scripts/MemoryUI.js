// JavaScript Document
(function ($) {
    $.fn.memory = function (members) {
        return this.each(function () {
            var _memoryUI = new memoryUI(this, members);
            _memoryUI.init();
        });
    }
})(jQuery);

function memoryUI(obj, members) {
    /******PROPERTIES********/
    var $self = this;
    this.cards = [];
    this.memory = {};
	this.data = new MemoryData();
    this.obj = obj;
    this.timestamp = 0;
	this.topScores={};
    this.state = State.OutOfPlay;
	

	
    /******EVENTS********/
	//only bind these if the bindings don't already exist
	if(window.GlobalSettings.initialized==false)
	{
	
    $(document).bind('onGameStart', function (e, data) {
        $self.gameStart(data);
    });
    $(document).bind('onOffsetDone', function (e, data) {
        $self.offsetCallback(data);
    });
    $(document).bind('onPlayBegin', function () {
       
		 //reset the time, if it was started previously
		 $self.timestamp=0;
		 
		 //just in case the stopwatch obj still exists
		 if(typeof stopwatch!='undefined')
		 {
		 window.clearInterval(stopwatch);
		 }
		 
		 //set up timer if it's a one player game
		 if(window.GlobalSettings.userMode==UserMode.OnePlayer)
		 {	
		 
			 setUpStopwatch();		 
		 }
		 else
		 {
			 setUpScoreboard();
			 
			 //show who is starting
		 	transitionPlayers();
				 
		 }
		 
		 
		 					
        $self.state = window.State.InPlay;
    });
    $(document).bind('onPlayOver', function () {
        $self.playOver();
    });
    $(document).bind('onPickVerified', function (e, data) {
        $self.displayResults(data);
    });
    
	$(document).on('click tap taphold','.car-cont', function (e, data) {
        $self.cardClick($(this).attr('data-id'))
    });
	}
	
    /******PUBLIC METHODS********/
    this.init = function () {
	
		window.GlobalSettings.initialized=true;
        
		//get topScores
		$self.topScores = $self.data.getTopScores();
		
        $self.memory= new FamilyMemory();
		
		$self.memory.init(members, "");
    }
	
    this.gameStart = function (deck) {
        $self.state = window.State.OutOfPlay;
		
		//this adds class to change css to beginner size
		if(GlobalSettings.gameLevel==GameLevel.beginner)
		{
			$(".GamePage").addClass("beginner");
		}
		
		$self.memory.score= (GlobalSettings.gameLevel*2);
        var canvas  = $self.addCardsWithRows(deck);
		
		
        $($self.obj).html(canvas);
		
        showGameIntro();
    
	}
    this.playOver = function () {
        clearInterval(window.stopwatch);
        $(".car-cont").hide();
        $("#go").hide();
		
		
		//add a differnt class depending on if this is a new high score
		if(window.GlobalSettings.userMode==UserMode.TwoPlayer)
		{
			var winner = $self.memory.getGameWinner();
			
		 $("#mark").html("Congratulations!<br/> Player " + winner + "<br/> WINS!").show();
			
		}
		else
		{
		isNewTopScore = newTopScore($self.timestamp);
		
		
		var gameFinishedClass= isNewTopScore?"topscorebox":"hooraybox";
		
		 $(".arrow_box").addClass(gameFinishedClass);
		
        $("#mark").html("Congratulations!<br/> You finished in<br/> " + formatDisplayTime($self.timestamp)).show();
        
		}
		
		$(".arrow_box").addClass(gameFinishedClass).show();
    }
	
    this.offsetCallback = function (d) {
        $(".car-cont[data-name=" + d + "]").fadeOut("fast");
        $(".firstPick").removeClass("firstPick car-cont");
        $(".secondPick").removeClass("secondPick car-cont");
        $(".picked").css("visibility", "hidden");
    }
	
	
    this.cardClick = function (id) {
        if ($self.state == window.State.OutOfPlay || $(".secondPick").length > 0) {
            return false;
        }
       
        var elem = $(".car-cont[data-id=" + id + "]");
			//playShortAudioClip();
        if ($(elem).hasClass("inGame") && !$(elem).hasClass("firstPick")) {
           	
			elem.find("img").show();		
         		
            if ($self.memory.mode == 2) {
                $(elem).addClass("secondPick");
                var firstpick = $(".firstPick").attr("data-name");
                $self.memory.checkMatch($(elem).attr("data-name"), firstpick);
            } else {
                $(elem).addClass("firstPick");
                $self.memory.mode = 2
            }
        }
    }
    this.displayResults = function (data) {
        if (data) {
			
			playAudioClip('/android_asset/www/Audio/yayclip.mp3');
			
			$('.firstPick').add('.secondPick').transition({height:'0px',width:'0px'},1000,function()
			{																					 
            $(".firstPick").css('visibility','hidden');
            $(".secondPick").css('visibility','hidden');		
			$(".firstPick").removeClass("firstPick");
			$(".secondPick").removeClass("secondPick");
			});
			if(window.GlobalSettings.userMode==UserMode.TwoPlayer)
		 	{			 
			 updateScoreboard();		 
		 	}
			
			 
        } else {
            setTimeout(function () {
                $(".firstPick").find("img").hide();
                $(".secondPick").find("img").hide();
				$(".firstPick").removeClass("firstPick");
				$(".secondPick").removeClass("secondPick");
            }, 1000);
        
		if(window.GlobalSettings.userMode==UserMode.TwoPlayer)
		 	{			 
			 transitionPlayers();		 
		 	}
		
		}
		
			
    }
    this.addCardsWithRows = function (deck) {
        var canvas = "";
        
		//this sets the number of cards to a row - 4 for advanced, 3 for beginner
		var cardCount =  4;
		
		
		if(GlobalSettings.gameLevel==GameLevel.beginner)
		{
			cardCount= 3;
		}
	
        if ($(".car-wrapper").length == 0) {

            for (i = 0; i < deck.length; i++) {
			var img = deck[i].isBase64 ?window.GlobalSettings.cardCache[parseInt(deck[i].imageUrl)]:deck[i].imageUrl
                canvas += "<div class='car-wrapper card-background' data-id='" + deck[i].ID + "'><div class='inGame car-cont'  data-id='" + deck[i].ID + "' data-name='" + deck[i].name + "'>  <img class=\"target-image\" src=\""+ img +"\"/></div></div>";
 
                if ((i + 1) % cardCount == 0) {
                    canvas += "<div class=\"car-clear\"></div>";
                }
            }
        }
		
        return canvas;
    }
	
	
    /******PRIVATE METHODS********/
	var setUpStopwatch=function()
	{
		//remove scoreboard elements
		$("#counter").css({'background-image':'url(Images/timer_new.png)'});
		$("#highscore").css({'background-image':'url(Images/highscore2.png)'});
		
	  //show the top score, if it's not 0
		 displayTopScore();
		 
        window.stopwatch = window.setInterval(function () {
            $self.timestamp += 1;
            $("#stopwatch").html(formatTime($self.timestamp,"#count"))
        }, 1000);
		
		$(".flipCount[id!='colon']").text("0");
		$("#counter").css('visibility','visible');
	 
	 //make sure scoreboard opacity is 100%
	 $(".scoreboard").css('opacity','1');
	 
	}
	
	var setUpScoreboard=function()
	{
		
		$("#counter").css({'background-image':'url(Images/playeroneimage.png)'});
		$("#highscore").css({'background-image':'url(Images/playertwoimage.png)'});
		
		$("#counter-container span").text("");
		
		$("#counter").add("#highscore").find(".twoplayer").text("0").show();
		
		$("#counter").css('visibility','visible');
		$("#highscore").css('visibility','visible');
		
		//make sure all the scores have been cleared if the are already created
		if($self.memory.Players!=undefined)
		{
			$self.memory.Players[0].score=0;
			$self.memory.Players[1].score=0;
		}
		 //make sure scoreboard opacity is 100%
	 	$(".scoreboard").css('opacity','1');
	}
	
	var updateScoreboard=function()
	{
		var points = $self.memory.getPointsForPlayers();
		
		//display points for player 1
		formatScore("tp-",points[0]);
		
		//display points for player 2
		formatScore("hs-tp-",points[1]);
		
		
	}
	
	var formatScore=function(elem,score)
	{
		var scoreArray = score.toString().split("");
		
		for(i=0;i<scoreArray.length;i++)
		{
			
			$("." + elem + i.toString()).html(scoreArray[i]);		
		
		}
		
		
	}
	
	var transitionPlayers=function()
	{
	//get current player and change opscity
		var currentPlayer =  $self.memory.getCurrentPlayer();
		
		//add opacity to other player, remove from current
		
		$(".scoreboard[data-player-id='" + currentPlayer +"']").transition({opacity: 1.0}, 500, function()
																										   
		{
			$(".scoreboard[data-player-id!='" + currentPlayer +"']").transition({opacity: 0.3}, 500, function()
				
				{
				});
			
		});
		
	};
	
	var displayTopScore=function()
	{
	var isBeginner = window.GlobalSettings.gameLevel==GameLevel.beginner;
			
	//get the beginner or advanced high scores
	var highScore= isBeginner? parseInt($self.topScores.beginner):parseInt($self.topScores.advanced);
	
	//code to execute if this is a new high score
	if(highScore!=0)
	{
		
		formatTime(highScore,"#hs-count");
		
		//playAudioClip('/android_asset/www/Audio/highscoreclip.mp3');
		
		$("#highscore").css('visibility','visible');		
	}
	
		
	}
	
	
	var newTopScore=function(timestamp)
	{
		var isNewTopScore=false;
		
		var isBeginner = window.GlobalSettings.gameLevel==GameLevel.beginner;
			
	//get the beginner or advanced high scores
		var highScore= isBeginner? parseInt($self.topScores.beginner):parseInt($self.topScores.advanced);
		
		if(highScore==0 || highScore > timestamp)
		{
			$self.topScores[isBeginner?'beginner':'advanced']=timestamp;
			
			isNewTopScore=true;
		}
		
		$self.data.setTopScores($self.topScores);
		
		return isNewTopScore;
					
	}
	
    var formatTime = function (time,elem) {
        var min = Math.floor(time / 60);
        var sec = Math.floor(time % 60);
        var arr = (addZero(min) + addZero(sec)).split('');
        for (j = 0; j < arr.length; j++) {
           
            $(elem + j).text(arr[j].toString());
        }
    }
    var formatDisplayTime = function (time) {
        var min = Math.floor(time / 60);
        var sec = Math.floor(time % 60);
        var s = sec == 1 ? "second" : "seconds";
        var m = sec == 1 ? "minute" : "minutes";
        return min + " " + m + " and " + sec + " " + s;
    }
    var addZero = function (d) {
        return d < 10 ? "0" + d : d;
    }
    var rotateStyle = function () {
        var rand = Math.floor((Math.random() * 24) + 1);
        rand = rand > 12 ? rand - (rand + (rand / 2)) : rand;
        return "-webkit-transform:rotate(" + rand + "deg);-moz-transform:rotate(" + rand + "deg);transform:rotate(" + rand + "deg);";
    }
}


function playAudioClip( clipPath) {
   // var media = new Media(clipPath,onSuccess,onError);
   //media.play();
}


function onSuccess() {
            console.log("playAudio():Audio Success");
        }

function onError(error) {
            alert('code: '    + error.code    + '\n' + 
                  'message: ' + error.message + '\n');
        }

function showGameIntro() {

	$(".arrow_box").show();
    $("#mark").text("Match 'Em!").fadeIn("slow");
	
	playAudioClip('/android_asset/www/Audio/matchemclip.mp3');
       
	   $(".arrow_box").animate({opacity: 1.0}, 2000,
								function(){
									 $(this).fadeOut();
									 $(document).trigger('onPlayBegin');	
									
									});
 	   
}



