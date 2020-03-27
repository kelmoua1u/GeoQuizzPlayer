import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'
import Game from '../components/Game.vue'
import List from '../components/ListSerie.vue'
import Result from '../components/ResultGame.vue'
import TopScore from '../components/TopScore.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/topscore',
    name: 'Top',
    component: TopScore
  },
  {
    path: '/game',
    name: 'Game',
    component: Game
  }
  ,{
    path: '/result',
    name: 'Result',
    component: Result
  },
  {
    path: '/list',
    name: 'ListSerie',
    component: List
  }
]

const router = new VueRouter({
  routes
})

export default router
