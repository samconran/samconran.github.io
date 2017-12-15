var player = {

  //Properties
  element : $('#playerAudio')[0],
  current : 0,
  songs : ["Glass Built Castles", "Crooks", "Say You Will", "Hang 'Em High", "Set in Stone", "Saviour", "Statues of Shame", "Drones", "White Eyes", "For Those That Sleep for a Thousand Years Shall Soon Wake", "To Take the First Turn"],
  playlist : [],

  //Methods
  play : function () {
    $('#playPauseBtn').addClass('playing').removeClass('fa-play').addClass('fa-pause');
    var audio = player.element;
    audio.play();
    black_peaks.debug($(audio).attr('src') + '\nCurrent: ' + player.current);
  },

  pause : function () {
    $('#playPauseBtn').removeClass('playing').removeClass('fa-pause').addClass('fa-play');

    var audio = player.element;
    audio.pause();
  },

  skip : function (d) {
    if (d == 'next')
      player.current = (player.current == (player.playlist.length - 1)) ? 0 : player.current + 1;
    else
      player.current = (player.current == 0) ? (player.playlist.length - 1) : player.current - 1;

    player.setSong(player.current)

    player.play();
  },

  shuffle : function (state) {
    if (state === 'shuffle-on') {
      player.playlist = shuffleArray(player.playlist)
    } else {
      player.playlist = player.songs.slice();
      player.current = player.songs.indexOf(player.playlist[player.current]);
    }
  },

  init : function () {
    var songs = player.songs,
        current = player.current;

    player.playlist = songs.slice();
    player.setSong(current);

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
        black_peaks.debug('Shuffle shuffle-off!');
      } else {
        $(this).removeClass('shuffle-off').addClass('shuffle-on');
        player.shuffle('shuffle-on');
        black_peaks.debug('Shuffle on!');
      }
    });
  },

  setSong : function (song) {
    var playlist = player.playlist,
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
