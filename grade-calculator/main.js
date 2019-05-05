const store = new Vuex.Store({
  state: {
    modules : [
      new Module('example', [40]),
      new Module('another', [])
    ]
  },
  mutations: {
    addModule (state, module) {
      state.modules = state.modules.push(module);
      calculateResults(state, module.id);
    },
    calculateResults(state, moduleId)
    {
      let module = state.modules.find(obj => obj.id === moduleId),
          currentMarks = module.inputMarks,
          getScore = c => (c.score/100 * c.worth),
          currentScore = currentMarks.reduce((a, b) => (getScore(a) + getScore(b))),
          currentWorth = currentMarks.reduce((a,b) => (a.worth + b.worth)),
          getResult = (n) => Math.ceil((n - currentScore) / (100-currentWorth) * 100);
      
      module.requiredMarks = {
        'Pass' : getResult(40),
        '2:2' : getResult(50),
        '2:1' : getResult(60),
        'First' : getResult(70)
      }    
    }
  }
});

/*
{
  name : "example",
  id: "example",
  inputMarks: [
    {
      name : "test1"
      score : 55
      worth : 50
    }
  ]
}
*/

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
  this.needed = {};
  function truncate(s) {
    return (s.toLowerCase().replace(/\s+/g, '-'));
  }
}