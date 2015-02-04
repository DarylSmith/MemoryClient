       // Wait for PhoneGap to load
        document.addEventListener("deviceready", onDeviceReady, false);
 
        function onDeviceReady() {
 		 pictureSource=navigator.camera.PictureSourceType; 
        	destinationType=navigator.camera.DestinationType; 
        }
 
        function getImage(index) {
            // Retrieve image file location from specified source
			currentIndex=index;
            navigator.camera.getPicture(uploadPhoto, function(message) {
			alert('get picture failed');
		},{
			quality: 50, 
			destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
			correctOrientation:true,
			targetWidth: 500,
  			targetHeight: 500
			
		}
            );
 
        }
	
	function upload(uri)
		{
			
		  alert(uri.substr(uri.lastIndexOf('/')+1).split('.')[0]  +"|"+  currentIndex +"|"+ window.localStorage.getItem('MemoryUserName') );

		}
 
 
 
        function uploadPhoto(imageURI) {
			
			var ext = imageURI.split('.')[1];
            var options = new FileUploadOptions();
			
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/"+ext;
			
			
 
            var params = {
            name:'Image' + currentIndex,
            user :window.localStorage.getItem('MemoryUserName'),
			index:currentIndex
			}
 
            options.params = params;
            options.chunkedMode = false;
 			//alert(params.name + "|" + params.user+ "|" +params.index +  "|" +imageURI);
			$(".ajax-loader").show();
            var ft = new FileTransfer();
            ft.upload(imageURI, "http://darylsmith.org/api/UploadPhoto", win, fail, options);
        }
 
        function win(r) {
      
			$(".ajax-loader").hide();
             var mem = new MemoryData();
			var username=window.localStorage.getItem('MemoryUserName');
			
			//remove the current photos and replace
			$(".photo-items").html("");
			
			mem.getListOfItems(username);
			//alert(r.response);
        }
 
     
	 
	    function fail(error) {
            alert("Sorry, that picture could not be uploaded.");
			   $(".ajax-loader").hide();
        }
 
        