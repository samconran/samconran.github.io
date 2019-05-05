const store = new Vuex.Store({
  state: {
    modules : [
      new Module('example', [40]),
      new Module('another', [])
    ]
  }
})

const AMGC = new Vue({
  store,
  data : {

  }
});

Vue.component('DisplayModules', {
  computed: {
    modules () {
      return this.$store.state.modules
    }
  },
});

Vue.component('Results', {
  computed: {
    modules () {
      return this.$store.state.modules
    }
  },
});

function Module (name, marks) {
  this.name = name;
  this.id = truncate(name);
  this.current = marks || [];
  function truncate(s) {
    return (s.toLowerCase().replace(/\s+/g, '-'));
  }
}