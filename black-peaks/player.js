var player = {

  //Properties
  element : $('#playerAudio')[0],
  current : 0,
  songs : ["Aeromancy", "All", "Catalyst", "Centred and One", "Flower of Life", "Outspoken", "To Survive", "Too Weak", "White Dove", "Written", "Zero"],
  playlist : [],

  //Methods
  play : function () {
    let audio = player.element;
    audio.play();
  },

  pause : function () {
    let audio = player.element;
    audio.pause();
  },

  next : function () {
    player.current = player.current == (player.playlist.length - 1) ? 0 : player.current + 1;
    player.setSong(player.current)

    player.play();
  },

  shuffle : function (state) {
    if (state === 'on') {
      player.playlist = shuffleArray(player.playlist)
    } else {
      player.playlist = player.songs.slice();
      player.current = player.songs.indexOf(player.playlist[player.current]);
    }
  },

  init : function () {
    let songs = player.songs,
        current = player.current;

    player.playlist = songs.slice();
    player.setSong(current);

    $('#playBtn').on('click', function() {
      player.play();
    });

    $('#pauseBtn').on('click', function() {
      player.pause();
    });

    $('#nextBtn').on('click', function() {
      player.next();
    });

    $(player.element).on('ended', function() {
       player.next();
    });

    $('#shuffleBtn').on('click', function() {
      if ($(this).hasClass('on')){
        $(this).removeClass('on').addClass('off');
        player.shuffle('off');
      } else {
        $(this).removeClass('off').addClass('on');
        player.shuffle('on');
      }
    });
  },

  setSong : function (song) {
    let playlist = player.playlist,
        audio = player.element;

    song = (isNaN(song) ? song : playlist[song]);
    $(audio).attr('src', ("./audio/" + song + ".mp3"));
  }

}

function shuffleArray (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

$(document).ready(player.init);
