<script>
export default {
  name: "Tabs",
  props:{
    TabItems: []
  },
  methods:{
    selectTab(index){
      this.TabItems.forEach(tab => {
        if(tab.index == index){
          tab.selected = true;
          this.currentTabIndex = tab.index;
        }else{
          tab.selected = false;
        }  
      })
    }
  }, 
  data() {
    return {
      currentTabIndex: 0
    };
  }
};
</script>

<template>
  <div>
    <ul class="nav nav-tabs">
      <li class="nav-item" v-for="(tab, index) in TabItems" :key="index">
        <a class="nav-link" :class="{ active: tab.selected }" @click="selectTab(tab.index)">{{ tab.name }}</a>
      </li>
    </ul>
    <div :class="`tab-content-` + currentTabIndex">
      <slot :name="`tab-content-` + currentTabIndex"></slot>
    </div>
  </div>
</template>

<style scoped>
.nav{
  margin-bottom:1rem;
}
.nav-item{
  cursor: pointer;
  color:black;
  font-size: 0.7rem;
}

.nav-item .nav-link{
  color:gray;
}
</style>
