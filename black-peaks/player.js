var player = {

  //Properties
  element : $('#playerAudio')[0],
  current : 0,
  songs : ["Glass Built Castles", "Crooks", "Say You Will", "Hang 'Em High", "Set in Stone", "Saviour", "Statues of Shame", "Drones", "White Eyes", "For Those That Sleep for a Thousand Years Shall Soon Wake", "To Take the First Turn"],
  playlist : [],

  //Methods
  play : function () {
    let audio = player.element;
    audio.play();
    debug($(audio).attr('src'));
  },

  pause : function () {
    let audio = player.element;
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

    $('#playPauseBtn').on('click', function() {
      let btn = $('#playPauseBtn'),
          p = 'playing';
      if ($(btn).hasClass(p)) {
        player.pause();
        $(btn).removeClass(p).text('play_arrow');
      }
      else {
        player.play();
        $(btn).addClass(p).text('pause');;
      }
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
      if ($(this).hasClass('on')){
        $(this).removeClass('on').addClass('off');
        player.shuffle('off');
        debug('Shuffle off!');
      } else {
        $(this).removeClass('off').addClass('on');
        player.shuffle('on');
        debug('Shuffle on!');
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
