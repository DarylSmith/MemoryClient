//window.device= {uuid:555};
$(document).bind("mobileinit", function () {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;

    /*global objects */
    window.State = {
        OutOfPlay: 0,
        InPlay: 1
    }

    window.GameLevel = {
        beginner: 6,
        advanced: 10,

        //used for selecting photos
        photoListMode: 10
    }
	
	window.UserMode = 
	{
	OnePlayer :1,
	TwoPlayer :2
		
	}

    window.GlobalSettings = {
        //a flag to check if all events are bound
        initialized: false,
        deviceType: 'small',
        cardCache: [],
        gameLevel: GameLevel.beginner,
		userMode : UserMode.TwoPlayer

    };


});



$(document).on('click', '.start-game,.back-to-game', function (event, ui) {


    $.mobile.changePage($("#menu"));
	$(".splashpagebox").hide();

});


$(document).on('pageshow', '#upload', function (event, ui) {
    var index = $(this).attr("data-url").split("=")[1];
    var user = window.localStorage.getItem('MemoryUserName');
    $(".user-field").val(user);
    $(".index-field").val(index);
});

function selectNewGame(level) {

    destroyGameObject();
	
	window.GlobalSettings.gameLevel = GameLevel[level];	
	$('#main-screen').addClass('custom-overlay');
	$(".splashpagebox").show();
	
   

}

function prepareGame(mode)
	{
		
		window.GlobalSettings.userMode=UserMode[mode];
		$(".splashpagebox").hide();
		$('#main-screen').removeClass('custom-overlay');
		 gameInit();
		
	}


function destroyGameObject() {

    $(".GamePage").removeClass("beginner");
    $("#counter").css('visibility', 'hidden');
	$("#highscore").css('visibility','hidden');	
	$(".arrow_box").removeClass("hooraybox").removeClass("topscorebox");
    //remove all dom elements placed in the table
    $("#table", "#main").html("");



}

function gameInit() {
    $("#start").hide();
    
    var username = "";
    var cards = [];
    username = window.localStorage.getItem('MemoryUserName');
    cacheKey = window.localStorage.getItem('MemoryUserCacheKey');
    var mem = new MemoryData();
    if (username) {
        //if the there is a username and the user's cards have been cached
        if (username != cacheKey) {
            //if there is no card cache (this is generally the first 
            cards = mem.getPlayerCards(username);
        } else {
            cards = mem.getPlayerCardsFromCache();
        }
    } else {
        cards = mem.getDefaultPlayerCards();
    }
	
	
    $.mobile.changePage($("#main"));
}
$(document).on('click', '.photo-link', function () {
	
	//check to make sure there is a network connection before allowing uploads
	var networkState = navigator.network.connection.type;
    
	if (networkState == Connection.NONE) {
        alert("Sorry, you need a network connection to upload photos");
		return false;
    }
													  
    var mem = new MemoryData();
    var username = window.localStorage.getItem('MemoryUserName');
    if (username) {
        $.mobile.changePage("PhotoListv2.html");
    } else {
        mem.addUserToDatabase(device.uuid);
    }
});
$(document).on('pageshow', '#list', function (event, ui) {

    // $.mobile.firstPage.remove();
    var mem = new MemoryData();
    var username = window.localStorage.getItem('MemoryUserName');
    mem.getListOfItems(username);
    $(".photo-items").live('click', function () {
        var _index = $(this).attr("data-image");
        $(".index-field").val(_index);
        $(".user-field").val(window.localStorage.getItem('MemoryUserName'));
    });
});