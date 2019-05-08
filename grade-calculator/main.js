const store = new Vuex.Store({
  state: {
    modules : []
  },
  mutations: {
    addModule (state, module) {
      module.id = module.name.toLowerCase().replace(/\s+/g, '-');
      state.modules.push(module);
      this.commit('calculateResults', module.id);
    },
    calculateResults(state, moduleId) {
      let module = state.modules.find(obj => obj.id === moduleId),
          currentMarks = module.inputMarks,
          getScore = c => (c.score/100 * c.worth),
          currentScore = currentMarks.reduce((a, b) => (a + getScore(b)), 0),
          currentWorth = currentMarks.reduce((a,b) => (a + parseInt(b.worth)), 0),
          getResult = (n) => Math.ceil((n - currentScore) / (100-currentWorth) * 100);
      
      module.currentScore = currentScore;
      module.requiredMarks = {
        'Pass' : getResult(40),
        '2:2' : getResult(50),
        '2:1' : getResult(60),
        'First' : getResult(70)
      }    
    },
    removeModule(state, index) {
      state.modules.splice(index,1);
    },
    initialiseStore(state) {
      if(localStorage.getItem('store')) {
        this.replaceState(
          Object.assign(state, JSON.parse(localStorage.getItem('store')))
        );
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
  methods : {
    removeModule(i) {
      this.$store.commit('removeModule', i);
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

Vue.component('AddModule', {
  computed: {
    modules () {
      return this.$store.state.modules
    },
    moduleNameState() {
      if (this.modules.length)
        return this.moduleName.length >= 3 && !(this.modules.filter(m => (m.name === this.moduleName)).length);
      else
        return this.moduleName.length >= 3;
    },
    moduleNameInvalidFeedback() {
      if(this.moduleName.length < 3)
        return `Please enter a valid module name with more than 3 characters (${this.moduleName.length}).`;
      else
        return `"${this.moduleName}" is already the name of a module.`;
    },
    validFormData() {
      return this.moduleNameState && this.moduleInputMarks.every(this.validateAssessmentName) && this.moduleInputMarks.every(this.validateAssessmentScore) && this.moduleInputMarks.every(this.validateAssessmentWorth);
    }
  },
  data() {
    return {
      moduleName : '',
      moduleInputMarks : [
        {
          name: '',
          score: '',
          worth:  ''        
        }
      ]
    }
  },
  methods : {
    validateAssessmentName(mark) {
      return mark.name.length > 0 && this.moduleInputMarks.filter(m => (m.name === mark.name)).length < 2;
    },
    validateAssessmentScore(mark) {
      return mark.score != '' && mark.score >= 0 && mark.score <= 100;
    },
    validateAssessmentWorth(mark) {
      return mark.worth != '' && mark.worth >= 0 && mark.score <= 100;
    },
    addMarks () {
      this.moduleInputMarks.push({name: '', score: '', worth:  '' });
    },
    removeMarks(n) {
      this.moduleInputMarks.splice(n,1);
    },
    saveModule () {
      let module = {
        name : this.moduleName,
        inputMarks : this.moduleInputMarks
      }
      this.$store.commit('addModule', module);
      this.$bvModal.hide('add-modal');
      this.resetData();
    },
    resetData() {
      this.moduleName = '';
      this.moduleInputMarks = [
        {
          name: '',
          score: '',
          worth:  ''        
        }
      ]
    }
  },
  template : "#add-module-template"
})

const AMGC = new Vue({
  store,
  el: '#content',
  beforeCreate() {
    this.$store.commit('initialiseStore');
    store.subscribe((_mutation, state) => {
      localStorage.setItem('store', JSON.stringify(state));
    });
	}
});