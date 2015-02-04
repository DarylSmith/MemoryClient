var MemoryData = function () {
    var $self = this;
    this.ext = "https://s3.amazonaws.com/DarylSmithDotOrg";
    this.cardCache = '';
    //this.root="http://localhost:50092";
    this.root = "http://darylsmith.org/";
    $("#btnUsername").live('click', function () {
        var email = $(".upload-text").find("input[type='text']").eq(1).val();
        var filter = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
        if (!filter.test(email)) {
            alert('Please enter a valid email address');
            return false;
        }
        $.getJSON($self.root + "/api/GetUsername?email=" + email + "&callback=?", function (data) {
            if (data.user.indexOf("exception") == -1 && data.user.indexOf("duplicate") == -1) {
                username = data.user;
                localStorage.setItem('MemoryUserName', data.user);
                $.mobile.changePage("PhotoListv2.html");
            } else if (data.user.indexOf("duplicate") != -1) {
                alert('You already have an account');
                return false;
            } else {
                alert('We are experiencing a problem.  Please try again later');
                return false;
            }
        });
    });
    this.addUserToDatabase = function (id) {
        $.getJSON($self.root + "/api/GetUsername?email=" + id + "&callback=?", function (data) {
            if (data.user.indexOf("exception") == -1 && data.user.indexOf("duplicate") == -1) {
                localStorage.setItem('MemoryUserName', data.user);
                $.mobile.changePage("PhotoListv2.html");
            }
        });
    }
    this.getListOfItems = function (_name) {
        $(".ajax-loader").show();
		
		//set game level variable to photo list, so we can return all cards
		window.GlobalSettings.gameLevel=GameLevel.photoListMode;
		
        var cards = $self.selectDefaultCards();
        $.getJSON($self.root + "/api/GetPlayers?name=" + _name + "&callback=?", function (data) {
            for (j = 0; j < 10; j++) {
                var card = getCardByRank(data, j);
                var hasData = card != 'void';
                if (hasData) {
                    window.localStorage.setItem('MemoryCard' + j, card.Image);
                }
          
                var src = hasData ? card.Image : cards[j].Url;
                var image = " <img class=\"List-Thumb\" src=" + src + " />";
                //add key to indicate cache is fully loaded!
                window.localStorage.setItem('MemoryUserCacheKey', _name);
                $(".photo-items").eq(j).prepend(image).append("<div class=\"clear\"></div>");
            }
            $(".ajax-loader").hide();
        });
    }
    this.getPlayerCardsWithUserName = function () {
        $('#link-username').click();
    }
    //gets cards from local storage as base64 strings
    this.getPlayerCardsFromCache = function () {
        var dCount = 0;
        var cards = [];
        var defaults = $self.selectDefaultCards();
		var cardCount= window.GlobalSettings.gameLevel;
        for (j = 0; j <cardCount; j++) {
            var image = window.localStorage.getItem('MemoryCard' + j);
            if (image != null) {
                var l = window.GlobalSettings.cardCache.push(image);
                cards.push({
                    Name: 'Player' + j,
                    Url: l - 1,
                    isBase64: true
                });
                //take this from local storage and add this to the in-memory cache
            } else {
                cards.push({
                    Name: defaults[dCount].Name,
                    Url: defaults[dCount].Url,
                    isBase64: false
                });
                dCount++;
            }
        }
        $("#table").memory(cards);
    }
    //loads cards if player is online, and stores as base64 strings
    this.getPlayerCards = function (_name, _set) {
        var cards = [];
        var defaults = $self.selectDefaultCards();
        var dCount = 0;
        $.getJSON($self.root + "/api/GetPlayers?name=" + _name + "&set=" + _set + "&callback=?", function (data) {
			var cardCount= window.GlobalSettings.gameLevel;
            for (j = 0; j < cardCount; j++) {
                if (data[j] != null) {
                    window.localStorage.setItem('MemoryCard' + j, data[j].Image);
                    cards.push({
                        Name: data[j].Name,
                        Url: 'MemoryCard' + j,
                        isBase64: true
                    });
                } else {
                    cards.push({
                        Name: defaults[dCount].Name,
                        Url: defaults[dCount].Url,
                        isBase64: false
                    });
                    dCount++;
                }
            }
            $("#table").memory(cards);
        });
        //add key to indicate cache is fully loaded!
        window.localStorage.setItem('MemoryUserCacheKey', _name);
    }
    this.getDefaultPlayerCards = function () {
        var cards = $self.selectDefaultCards();
        $("#table").memory(cards);
    }
    this.selectDefaultCards = function (arr) {
        var cards = [];
        cards.push({
            Name: 'Daddy*',
            Url: 'Images/7230aa2b-f6b6-4484-bbee-5f8d575d5241_Img2.png',
			isBase64: false
			
        });
        cards.push({
            Name: 'Baby*',
            Url: 'Images/1bf3ef93-6404-460e-8d6d-32529f33a752_Img2.png',
			isBase64: false
        });
        cards.push({
            Name: 'Grandma*',
            Url: 'Images/7230aa2b-f6b6-4484-bbee-5f8d575d5241_Img8.png',
			isBase64: false
        });
        cards.push({
            Name: 'Grandpa*',
            Url: 'Images/7230aa2b-f6b6-4484-bbee-5f8d575d5241_Img3.png',
			isBase64: false
        });
        cards.push({
            Name: 'Uncle*',
            Url: 'Images/1bf3ef93-6404-460e-8d6d-32529f33a752_Img1.png',
			isBase64: false
        });
        cards.push({
            Name: 'Cat*',
            Url: 'Images/7230aa2b-f6b6-4484-bbee-5f8d575d5241_Img5.png',
			isBase64: false
        });
		
        cards.push({
            Name: 'Dog*',
            Url: 'Images/7230aa2b-f6b6-4484-bbee-5f8d575d5241_Img6.png',
			isBase64: false
        });
        cards.push({
            Name: 'Mommy*',
            Url: 'Images/7230aa2b-f6b6-4484-bbee-5f8d575d5241_Img1.png',
			isBase64: false
        });
        cards.push({
            Name: 'PetMonster*',
            Url: 'Images/PetMonster.png',
			isBase64: false
        });
        cards.push({
            Name: 'crazycousin*',
            Url: 'Images/crazycousin.png',
			isBase64: false
        });
		
		
		//return only the nunber that is allocated for this level of play
        return cards.slice(0,(window.GlobalSettings.gameLevel));
    }
	
	//retrieves tops scrores from memory and returns it as an object
	this.getTopScores=function(){
		
		//retrieve top scores from the cache
		var topScoreStr = window.localStorage.getItem("topScores");
		
		//if there is no top score in cache build a new top score object
		if (topScoreStr===null)
		{
			return topScoreObject();	
		}
		else
		{		
			return $.parseJSON(topScoreStr);		
		}
	
	}
	
	this.setTopScores=function(topScores)
	{
		
		window.localStorage.setItem("topScores",JSON.stringify(topScores));
	}
	/*Private methods */
	
    var getCardByRank = function (data, index) {
		var cardCount= window.GlobalSettings.gameLevel;
        for (i = 0; i < cardCount; i++) {
            if (data[i] != null && data[i] != 'undefined' && (index) == data[i].Rank) {
                return data[i];
                break;
            }
        }
        return 'void';
    }
	
	var topScoreObject = function()
	
	{
	return {advanced:0,beginner:0};	
			
	}
	
	

}