var player = {

  //Properties
  element : $('#playerAudio')[0],
  current : 0,
  songs : ["Glass Built Castles", "Crooks", "Say You Will", "Hang 'Em High", "Set in Stone", "Saviour", "Statues of Shame", "Drones", "White Eyes", "For Those That Sleep for a Thousand Years Shall Soon Wake", "To Take the First Turn"],
  playlist : [],

  //Methods

  //Add the playing class to the play/pause button and play the audio
  play : function () {
    $('#playPauseBtn').addClass('playing').removeClass('fa-play').addClass('fa-pause');
    var audio = player.element;
    audio.play();
    black_peaks.debug($(audio).attr('src') + '\nCurrent: ' + player.current);
  },

  //Remove the playing class from the play/pause button and pause the audio
  pause : function () {
    $('#playPauseBtn').removeClass('playing').removeClass('fa-pause').addClass('fa-play');
    var audio = player.element;
    audio.pause();
  },

  //Set the song to the next song if d== next. If not (d=='previous'), skip to the previous song
  skip : function (d) {
    var song;

    if (d == 'next')
      song = (player.current == (player.playlist.length - 1)) ? 0 : player.current + 1;
    else
      song = (player.current == 0) ? (player.playlist.length - 1) : player.current - 1;

    player.setSong(song)
    player.play();
  },

  //If the state is to shuffle-on, replace the playlist with a shuffled version. If shuffle-off, replace with the in-order version from the user object
  shuffle : function (state) {
    if (state === 'shuffle-on') {
      player.playlist = shuffleArray(player.playlist);
      player.current = player.playlist.indexOf(player.songs[player.current]);
    } else {
      player.playlist = black_peaks.user.playlist.slice();
      player.current = player.songs.indexOf(player.playlist[player.current]);
    }
  },

  //Set the playlist to that of the user object, then perform a localStorage save function
  update: function() {
    player.playlist = black_peaks.user.playlist.slice();
    player.setSong(0);
    black_peaks.user.save();
  },

  //Initialisation function. Sets the volume, as well as setting the playlist.
  init : function () {
    player.element.volume = 0.5;

    //If a user-defined playlist loaded in, set playlist to that. Otherwise, all songs.
    if (black_peaks.user.playlist.length > 0)
      player.update();
    else {
      player.playlist = player.songs.slice();
      black_peaks.user.playlist = player.playlist.slice();
    }

    player.setSong(0);

    //Set up player click events for all player controls.
    $('#playPauseBtn').on('click', function() {
      if ($('#playPauseBtn').hasClass('playing'))
        player.pause();
      else
        player.play();
    });

    $('#nextBtn').on('click', function() {
      player.skip('next');
    });

    $('#prevBtn').on('click', function() {
      player.skip('prev');
    });

    $(player.element).on('ended', function() {
       player.skip('next');
    });

    $('#shuffleBtn').on('click', function() {
      if ($(this).hasClass('shuffle-on')){
        $(this).removeClass('shuffle-on').addClass('shuffle-off');
        player.shuffle('shuffle-off');
        black_peaks.debug('Shuffle off!');
      } else {
        $(this).removeClass('shuffle-off').addClass('shuffle-on');
        player.shuffle('shuffle-on');
        black_peaks.debug('Shuffle on!');
      }
    });
  },

  //Function for setting the current song
  setSong : function (song) {
    var playlist = player.playlist,
        audio = player.element,
        song_index;

    song = (isNaN(song) ? song : playlist[song]);
    song_index = playlist.indexOf(song);
    $(audio).attr('src', ("./assets/audio/" + song + ".mp3"));
    player.current = song_index;
    $('#player #song-info h1').text(song);
  }

}

//Function for shuffling an array
function shuffleArray (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

//On document.ready, run the initialisation function
$(document).ready(player.init);
