// JavaScript Document
var FamilyMemory = function() {
    /******PROPERTIES********/
    var $self = this;
    //card object
    this.card = function() {
        this.background = '../Images/background_new2.png';
        this.imageUrl = '';
        this.ID = '';
        this.name = '';
        this.mode = 1;
        this.score = 0;
		//indicates whether image points to location or base64 string
		this.isBase64=false;
    }
	
	//object for two player games
	this.player=function()
	{
		this.score =0;		
	}
    this.deck = [];
	this.score =0;

    this.shuffledDeck = [];
    //solo (against clock) or 2 player

	//this holds the current player objects
	this.Players =[];
	
    this.currentPlayer = 0;
    //contains current event
    this.gameEvents = { FirstPick: 1, SecondPick: 2 }
    this.currentGameEvent = {};

    /******PUBLIC METHODS********/
    //setup game
    this.init = function(names, mode) {
        $self.userMode = mode;

        for (i = 0; i < 2; i++) {
            for (j = 0; j < names.length; j++) {
                var myCard = new $self.card();
                myCard.imageUrl = names[j].Url;
                myCard.ID = i + "" + j;
                myCard.name = names[j].Name;
				myCard.isBase64=names[j].isBase64;
                $self.deck.push(myCard);
            }

        }
		
		//if this is a two player game, initialize the two players
		
		if(window.GlobalSettings.userMode == UserMode.TwoPlayer)
		{
		
		//re-initialize, in case there are some leftover values
		$self.Players=[];
		
		for (i=0;i<2;i++)
			{
				var playerObj = new $self.player();		
				$self.Players.push(playerObj);
			
			}
		}
		
        $self.currentPlayer = 0;
        $self.currentGameEvent = $self.gameEvents.FirstPick;
        for (i = 0; i < $self.deck.length; i++) {
            $self.shuffleCardsRecursively();
        }
        $self.score = $self.deck.length;
        //raise game start event and pass deck to caller
        $(document).trigger('onGameStart', [$self.shuffledDeck]);




    }
	
	this.getGameWinner=function()
		{
			
			return $self.Players[0].score>$self.Players[1].score?"one": "two";
		}
	
	this.getPointsForPlayers=function()
		{
		var points = [];
		for (var p in $self.Players)
			{
				points.push($self.Players[p].score);
			}
			
			return points;
		}
	
	this.getCurrentPlayer=function()
		{
			return $self.currentPlayer;
			
		}
	
    this.checkMatch = function(a, b) {
        var i = a == b ? true : false;
        if (i) {
            $self.score -= 2;
			
			if(window.GlobalSettings.userMode == UserMode.TwoPlayer)
				{
					addPointsForPlayer();				
				}						
        }
		else
			{			  
			  changePlayerTurn();			
			}
		
        $self.mode = 1;

        if ($self.score == 0) {
            $(document).trigger('onPlayOver');
        }
        else {
            $(document).trigger('onPickVerified', [i]);
        }

    }



    //private methods
	
	
	var addPointsForPlayer=function()
		{
			var currentPlayer = $self.Players[$self.currentPlayer];
			currentPlayer.score+=2;
			return currentPlayer.score;
			
		}
		
	var changePlayerTurn=function()
	{
		var turn =  $self.currentPlayer	;
		$self.currentPlayer = turn==0?1:0;
	}


    this.shuffleCardsRecursively = function() {
        var randomNumber = Math.floor(Math.random() * ($self.deck.length))

        if ($self.deck[randomNumber].mode == 1) {

            $self.shuffledDeck.push($self.deck[randomNumber]);
            $self.deck[randomNumber].mode = 0;

        }
        else {

            $self.shuffleCardsRecursively();
        }

    }



}