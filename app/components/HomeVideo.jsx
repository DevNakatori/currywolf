function HomeVideo (){
  return (
    <>    
       <div className="video-container">
      <video autoPlay muted loop id="myVideo" height="100%" width="100%">
        <source src="../app/assets/home-video.mp4" type="video/mp4"></source>
        Your browser does not support HTML5 video.
      </video>
      <div className="overlay-video">
        <div className="text">Click anywhere to continue</div>
      </div>
    </div>
    </>
  );
}

export default HomeVideo;