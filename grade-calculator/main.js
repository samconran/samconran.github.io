Vue.config.devtools = true;

const store = new Vuex.Store({
  state: {
    showResults : false,
    modules : [
      {
        "name": "example",
        "id": "example",
        "inputMarks": [
          {
            "name": "test1",
            "score": 100,
            "worth": 50
          }
        ],
        "currentScore": 50,
        "requiredMarks": {
          "Pass": -20,
          "2:2": 0,
          "2:1": 20,
          "First": 40
        }
      },
      {
        "name": "another",
        "id": "another",
        "inputMarks": [
          {
            "name": "test2",
            "score": 32,
            "worth": 40
          }
        ],
        "currentScore": 12.8,
        "requiredMarks": {
          "Pass": 46,
          "2:2": 62,
          "2:1": 79,
          "First": 96
        }
      }
    ]
  },
  mutations: {
    addModule (state, module) {
      module.id = module.name.toLowerCase().replace(/\s+/g, '-');
      state.modules = state.modules.push(module);
      calculateResults(state, module.id);
    },
    calculateResults(state, moduleId)
    {
      let module = state.modules.find(obj => obj.id === moduleId),
          currentMarks = module.inputMarks,
          getScore = c => (c.score/100 * c.worth),
          currentScore = currentMarks.reduce((a, b) => (a + getScore(b)), 0),
          currentWorth = currentMarks.reduce((a,b) => (a + b.worth), 0),
          getResult = (n) => Math.ceil((n - currentScore) / (100-currentWorth) * 100);
      
      module.currentScore = currentScore;
      module.requiredMarks = {
        'Pass' : getResult(40),
        '2:2' : getResult(50),
        '2:1' : getResult(60),
        'First' : getResult(70)
      }    
    }
  }
});

Vue.component('DisplayModules', {
  computed: {
    modules () {
      return this.$store.state.modules
    }
  },
  template : "#display-modules-template"
});

Vue.component('Results', {
  computed: {
    modules () {
      return this.$store.state.modules
    }
  },
  template : "#display-results-template"
});

const AMGC = new Vue({
  store,
  el: '#content'
});