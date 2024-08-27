<!--底部播放控件-->
<template>
  <div class="bottom">
    <div class="left">
      <img :src="songStore.currentSong.al?songStore.currentSong.al.picUrl:logo" alt="" @click="handleLyric">
      <div class="song">
        <!--判断该歌曲是否喜欢-->
        <div class="row">
          <span class="song-name">{{ songStore.currentSong?.name }}</span>&nbsp;&nbsp;&nbsp;
          <div>
            <i v-if="songStore.currentSong.fee==1" class="tag vip-tag">VIP</i>

            <img
                v-if="useLikedFormat(songStore.currentSong.id,userStore.likedIds)&&songStore.currentSong.id"
                src="@/assets/img/heart.png"
                class="heart"

                @click="handleLiked(songStore.currentSong.id,useLikedFormat(songStore.currentSong.id,userStore.likedIds))">
            <img v-if="!useLikedFormat(songStore.currentSong.id,userStore.likedIds)&&songStore.currentSong.id"
                 alt=""
                 class="heart"
                 src="@/assets/img/hollow-heart.png" @click="handleLiked(songStore.currentSong.id,useLikedFormat(songStore.currentSong.id,userStore.likedIds))">
          </div>
        </div>
        <div class="artist">
          <span
              v-for="(v,i) in songStore.currentSong?.ar"
              :key="v.id" class="artist-name"
              @click="toArtist(v)">
            {{ songStore.currentSong?.ar.length > 1 && i !== 0 ? '/' : '' }}{{ v.name }}</span>
        </div>
      </div>
    </div>
    <div class="center">
      <!--播放音乐控件-->
      <div class="play-tool">
        <div class="play-model">
          <i
              v-if="playMode===1"
              class="iconfont icon-xunhuan"
              @click="changePlayMode"></i>
          <i
              v-else-if="playMode===2"
              class="iconfont icon-suiji1"
              @click="changePlayMode"></i>
          <i
              v-else
              class="iconfont icon-danquxunhuan"
              @click="changePlayMode"></i>
        </div>

        <i class="large iconfont icon-shangyishou" @click="switchSong('previous')"></i>
        <!--点击开始播放-->
        <i v-if="!songStore.playState" class="large iconfont icon-icon_play" @click="changePlayState"></i>
        <!--点击暂停播放-->
        <i v-else class="large iconfont icon-zantingtingzhi" @click="changePlayState"></i>
        <i class="large iconfont icon-xiayishou" @click="switchSong('next')"></i>
      </div>
      <div class="progress">
        <!--        播放的当前进度-->

        <span>{{ currentTime ? useDurationFormat(currentTime * 1000) : '00:00' }}</span>
        <!--歌曲进度调节条-->
        <el-slider
            v-model="playProgress"
            :max="100"
            :show-tooltip="false"
            @change="changeProgress"
            @mousedown='isDraging = true'
            @mouseup='isDraging = false'
        ></el-slider>
        <span>   {{ songStore.currentSong.dt ? useDurationFormat(songStore.currentSong.dt) : '00:00' }}</span>
        <!--必须加上autoplay，音源切换时自动播放-->
        <audio
            ref="musicAudio"
            :autoplay="songStore.playState"
            :src="currentSongUrl"
            @timeupdate="updateProgress"
        ></audio>
      </div>
    </div>
    <div class="right">
      <img
          v-if="volumeProgress==0"
          alt=""
          class="volumeCross" src="@/assets/img/volumeCross.png" @click="closeVolume">
      <img
          v-else
          alt=""
          class="volumeCross" src="@/assets/img/volumeOpen.png" @click="closeVolume">
      <div class="volume">
        <!--音量调节条-->
        <el-slider
            v-model="volumeProgress"
            :show-tooltip="false"
            width="100"
            @change="changeVolume"
        ></el-slider>
      </div>
      <i class="iconfont icon-bofangliebiao" @click="listShow=!listShow"></i>
    </div>
  </div>
  <!--歌曲播放列表-->
  <el-drawer
      v-model="listShow"
      title="当前播放"
      direction="rtl"
      size="370"
  >
    <div class="top-control">
      <span class="total">{{`共${songStore.playList.length}首歌`}}</span>
      <div class="btn">
        <div @click="clearAll">清空列表</div>
      </div>
    </div>
    <!--播放列表-->
    <div
        v-if="songStore.playList.length>0"
        class="song-list text">
      <ul>
        <li
            v-for="v in songStore.playList"
            :class="v.id===songStore.currentSong.id?'active-song iconfont':''"
            :tabindex="v.id"
            @dblclick="changeSong(v)">
          <div class="list-left">
            <span class="song-name">{{ v.name }}</span>
          </div>
          <div class="list-center">
            <span
                v-for="(v2,i2) in v.ar"
                class="artist-name"
                @click="toArtist(v2)">{{ v.ar.length > 1 && i2 !== 0 ? '/' : '' }}{{ v2.name }}</span>
          </div>
          <div class="list-right">
            <span>{{ useDurationFormat(v.dt) }}</span>
          </div>
        </li>
      </ul>
    </div>
    <span v-else class="null">您还没有添加任何歌曲！</span>
  </el-drawer>
  <!--滚动歌词抽屉-->
  <LyricScroll

      :currentTime="musicAudio?.currentTime"
      :lyricShow="lyricShow"
      @getLyricShow="getLyricShow"
  ></LyricScroll>
</template>

<script lang="ts" setup>
import LyricScroll from '@/components/LyricScroll/index.vue'
import {useRouter} from 'vue-router'
import {ref, watch, reactive} from 'vue'
import {useSong} from '@/store/song.ts'
import {useUser} from '@/store/user.ts'
import logo from '@/assets/img/logo.png'
import {useDurationFormat} from '@/hooks/useDurationFormat.ts'
import {likeSong, songUrl, songLyric} from "@/api/song/index"
import {useLikedFormat} from '@/hooks/useLikedFormat.ts'
import {usetimeFormat} from "@/hooks/usetimeFormat.ts"
import {ElMessage} from 'element-plus'
import {useArtistInfo} from "../../hooks/useArtistInfo";
import {useSpacebar} from "../../hooks/useSpacebar";

//变量

const router = useRouter()
const currentSongUrl = ref('') //当前播放的歌曲的url
const musicAudio = ref() //音乐播放组件
let timer = ref() //定时器。用于video的p
let playProgress = ref(0) //音乐播放进度百分比
let currentTime = ref() //audio组件当前播放时间(只用于展示数据)
let isDraging = ref(false)//是否在拖动播放进度条
//抽屉列表抽屉
const listShow = ref(false)
const songStore = useSong()
const userStore = useUser()
let songTimeSize = ref(0) //歌曲可播放的长度。
//歌词滚动抽屉
let lyricShow = ref(false)
const handleLyric = () => {

    lyricShow.value = !lyricShow.value

}
//获取子组件歌词滚动抽屉状态
const getLyricShow = (v: boolean) => {
  lyricShow.value = v
}

let likeQuery = reactive({ //喜欢歌曲请求参数
  id: <number>0,
  like: <boolean>true,
})
//方法

//跳转到歌手页

const toArtist =async (v) => {
  //歌手信息
  let info =await useArtistInfo(v)
  await router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(info)
    }
  })
}
// 拉进度条
const changeProgress = (per: number) => {
  // 给播放中的歌曲设定进度

  currentTime.value = Math.floor((per / 100) * songTimeSize.value);
  musicAudio.value.currentTime = currentTime.value

  console.log('进度', musicAudio.value.currentTime)


}

//改变播放音量
let volumeProgress = ref(40)
const changeVolume = (v: number) => {
  //musicAudio.value.volume规定取值范围【0,1】
  musicAudio.value.volume = v / 100
  volumeProgress.value = v
}

//点击音量图标
let beforeVolume = ref(0) //变化之前的音量
const closeVolume = () => {
  if (musicAudio.value.volume !== 0) {
    beforeVolume.value = musicAudio.value.volume
    volumeProgress.value = musicAudio.value.volume = 0
  } else {
    musicAudio.value.volume = beforeVolume.value
    volumeProgress.value = beforeVolume.value * 100
  }
}

//点播放列表切歌
const changeSong = (v: any) => {
  songStore.currentSong = v
  console.log('当前歌曲的信息', songStore.currentSong, v)
}

//改变播放方式
let playMode = ref(1) //1:循环 2：乱序 3：单曲循环\
const changePlayMode = () => {
  playMode.value = playMode.value === 3 ? 1 : playMode.value + 1
}


//歌曲播放状态改变
const changePlayState = () => {
//当前点击过歌曲才能播放
  if (songStore.currentSong.id) {
    //修改播放时间【设置这个，当一首歌正常播放结束之后，再次点击播放按钮，进度条会得到重置】
    if (!songStore.playState) {
      clearTimeout(timer.value);
      timer.value = setTimeout(() => {
        musicAudio.value.play()
        songStore.playState = true
      }, 500);
      console.log('播放')
    } else {
      musicAudio.value.pause()
      songStore.playState = false
      console.log('暂停')
    }
  }
}
//当歌曲正在播放时，手动更新歌曲进度条，而audio组件的currentTime会自增不必管。
const updateProgress = () => {
  //暂停状态且或者拖动进度条的话的话，就不更新播放进度
  if (!songStore.playState || isDraging.value) return false
  if (songStore.playState) {

    currentTime.value = musicAudio.value.currentTime;

    // 让进度条位置与播放器位置同步
    playProgress.value = Math.ceil((musicAudio.value.currentTime / songTimeSize.value) * 100);
    if ((musicAudio.value.currentTime >= songStore.currentSong?.dt / 1000) || (musicAudio.value.currentTime >= songTimeSize.value && songStore.currentSong.fee == 1)) {
      //当手动更新的进度条达到当前歌曲时长 ，则自动播放下一曲(且vip歌曲试听结束，也下一首)
      if (playMode.value === 1 || playMode.value === 2) {
        console.log('下一首')
        switchSong('next')
      } else {
        //单曲循环
        playProgress.value = 0
        musicAudio.value.currentTime = 0
        musicAudio.value.play()

      }
    }
  }
}

//播放完成下一曲
const switchSong = (v: string) => {
  //点击下一首
  if (v === 'next') {
    //当播放模式是循环播放或者单曲循环时
    if (playMode.value === 1 || playMode.value === 3) {
      songStore.playList.some((v: any, i: number) => {
        if (v.id === songStore.currentSong.id && songStore.playList[i + 1]) {
          //找到了下一首，播放下一首
          songStore.currentSong = songStore.playList[i + 1]
          console.log('找到了一下一首', songStore.currentSong)
          return true
        } else {
          if (i === songStore.playList.length - 1) {
            //查找完毕都没发现下一首可播放的歌曲
            songStore.currentSong = songStore.playList[0]
          }
        }
      })
    } else {
      //乱序播放，下一首乱序
      let index = Math.floor(Math.random() * (songStore.playList.length - 0))   //生成随机数，大于等于0，小于播放列表长度
      songStore.currentSong = songStore.playList[index]
    }
  } else {
    //点击上一首
    console.log('上一首')
    //当播放模式是循环播放或者单曲循环时
    if (playMode.value === 1 || playMode.value === 3) {
      // console.log('当前歌曲信息',songStore.currentSong)
      let isFound = songStore.playList.some((v: any, i: number) => {
        console.log(v.name, v.id, v.id == songStore.currentSong.id, songStore.currentSong.id)
        if (v.id == songStore.currentSong.id && songStore.playList[i - 1]) {
          //找到了上一首，播放上一首
          songStore.currentSong = songStore.playList[i - 1]
          return true
        }
      })
      if (!isFound) {
        //找完列表没找到上一首，播放最后一首
        // console.log('条件2')
        songStore.currentSong = songStore.playList[songStore.playList.length - 1]
      }
    } else {
      //乱序播放。直接乱播！
      let index = Math.floor(Math.random() * (songStore.playList.length - 0))   //生成随机数，大于等于0，小于播放列表长度
      songStore.currentSong = songStore.playList[index]
    }
  }
}
//喜欢歌曲
const handleLiked = (id: number, like: boolean) => { //获得该歌曲当前喜欢状态
  if (!userStore.accountInfo) {
    ElMessage('请先登录哦~(｡•ˇ‸ˇ•｡)')
    return false
  }
  likeQuery.id = id
  likeQuery.like = !like
  likeSong(likeQuery).then((res: any) => {
    if (res.code === 200) {
//歌曲小红心响应式
      if (like) {
        userStore.likedIds.some((v: number, i: number) => {
          if (v === id) {
            userStore.likedIds.splice(i, 1)
            return true
          }
        })
      } else {
        userStore.likedIds.push(id)
        return true
      }
    }
  })
}
//获得该歌曲的播放url
const getSongUrl = () => {
  musicAudio.value.pause()
  songStore.playState =false
  songUrl({id: songStore.currentSong.id}).then((res: any) => {
    //未获得url之前播放控件先初始化！
    playProgress.value = 0
    if (res.code === 200) {
      songStore.playState =true
      getSongLyric()
      //歌曲可播放的时长（vip有限制）
      songTimeSize.value = res.data[0].time / 1000
      console.log('得到了可播放时长', songTimeSize.value)
      //每秒都调用更新函数，时刻更新歌曲进度
      // setInterval(() => updateProgress(), 1000);
      currentSongUrl.value = res.data[0].url
      playProgress.value = 0
      clearTimeout(timer.value);
      timer.value = setTimeout(() => {
        musicAudio.value.play()
        songStore.playState = true
      }, 500);
    } else {
      ElMessage('呜呜，获取歌曲资源失败了哦~(｡•ˇ‸ˇ•｡)')
      musicAudio.value.pause()
      songStore.playState = false
    }
  })
}

  //获取歌曲歌词
  const getSongLyric = () => {

    songLyric({id: songStore.currentSong.id}).then((res: any) => {
      if (res.code === 200) {
        if (res.lrc.lyric) {
          songStore.currentSong.lyric = lyricFormat(res.lrc.lyric)
        }

      }
    })
  }

  //对后端返回的歌词字符串进行处理。处理好每段歌词内容，歌词时间节点
  const lyricFormat = (lyricStr: any) => {
    let arr = lyricStr.split('[')
    arr.splice(0, 1)
    return arr.map((v: any) => {
      let content = v.slice(v.indexOf(']') + 1)
      let time = usetimeFormat(v.slice(0, v.indexOf(']')))
      return {
        content,
        time,
      }
    })
  }
//清空播放列表所有歌曲
const clearAll =()=>{
  songStore.playState =false
  songStore.playListId = 0
  songStore.playList = []
  songStore.currentSong = {}
}
//监听当前歌曲变化了就播放这首歌
watch(() => songStore.currentSong, () => {
if(!songStore.currentSong.id) return false
  musicAudio.value.pause()
  getSongUrl()
})
//监听playstate播放状态变化
watch(() => songStore.playState, (newVal: boolean) => {
  musicAudio.value.pause()
  if (newVal) {
    clearTimeout(timer.value);
    timer.value = setTimeout(() => {
      musicAudio.value.play()
    }, 500);
    console.log('播放了歌曲')
  } else {
    musicAudio.value.pause()
  }
})
// TODO:监听页面刷新事件，把当前歌曲清除！！！！
window.onbeforeunload = function () {
  console.log('浏览器刷新')
  songStore.currentSong = {}
  songStore.playList = []
  songStore.playListId =0
  musicAudio.value.pause()
  songStore.playState = false
}

 useSpacebar(changePlayState)
</script>

<style lang="less" scoped>

.bottom {
  min-width: 1145px;
  position: fixed;
  bottom: 0;
  z-index: 5000;
  display: flex;
  height: 60px;
  border-top: @lightTheme solid 1px;
  width: 100%;
  background-color: #fff;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

:deep(.el-slider__button) {
  width: 11px;
  height: 11px;
  border: 1px solid @theme;
}

.left {
  display: flex;
  height: 45px;
  cursor: pointer;


  img {
    width: 45px;
    height: 45px;
    border-radius: 5px;
  }

  .song {
    //left: 48px;
    position: relative;
    margin-left: 10px;
    white-space: nowrap;
    //max-width: 200px;
    display: flex;
    flex-direction: column;
    //right: -20px;
  }

  //.song-name {
  //  display: inline-block;
  //  .long-text;
  //  max-width: 160px;
  //}
  .row {
    //top:0;
    //right: 0;
    //position:absolute ;
    display: flex;
    justify-content: center;

    .iconfont {
      margin: 0;
    }

    .vip-tag {
      color: #fe703b;
      border-color: #fe703b;


      //line-height: 16px;
      //margin-top: 1px;   /* position: absolute;

      margin-right: 10px !important;
    }
    .tag{

    }

    .heart {
      width: 19px;
      height: 19px;
    }


  }


  .artist {
    max-width: 150px;
    //margin-top: -10px;
    .long-text;
    font-size: 13px;
  }
}


.null {
  color: @lightFontColor;
  position: absolute;
  top: 280px;
  left: 23%;
}

.center {
  width: 450px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  .play-model {
    position: absolute;
    left: 100px;
    margin-top: 3px;

    .iconfont {
      font-size: 16px;
    }

    .icon-suiji1:before {
      font-size: 10px;
    }

  }

  .progress {
    line-height: 4px;
    display: flex;
    width: 450px;

    .el-slider {
      margin-bottom: 26px;
      height: 4px;
      margin-left: 10px;
      margin-right: 10px;

      .progress .el-slider__runway {
        width: 100%;
      }
    }

    span {
      font-size: 12px;
      color: @lightFontColor;
    }
  }

  .play-tool {
    margin: 30px auto 0;
    height: 40px;
    //background-color: pink;
    width: 150px;
    display: flex;
    justify-content: space-between;

  }

  .large {
    font-size: 20px;
  }

  .icon-icon_play, .icon-zantingtingzhi {
    margin-top: -1px !important;
    font-size: 15px;
    background-color: @pink;
    border-radius: 50%;
    line-height: 36px;
    text-align: center;
    width: 35px;
    height: 35px;

  }

  .icon-zantingtingzhi {
    font-size: 22px;
  }

  .icon-icon_play:hover, .icon-zantingtingzhi:hover {
    background-color: @lightTheme;
    width: 36px;
    height: 36px;
  }
}

.right {
  display: flex;
  width: 200px;
  justify-content: space-between;

  .volume {
    width: 100px;
  }

  .volumeCross {
    width: 22px;
    margin-top: 5px;
  }

  .iconfont {
    font-size: 20px;
    font-weight: 400;
  }
}

//抽屉
:global(.el-drawer__title) {

  color: @fontColor;
  font-weight: 700;
  font-size:20px;
  margin-left: 10px;
  margin-top: 10px;
}

:global(.el-drawer__body) {
  padding: 0 0 60px;
}

//歌曲列表
.song-list {
  //margin-top: 20px;
  width: 100%;

  .iconfont {
    margin: 0 !important;
  }

  .active-song {
    background-color: @pink !important;
    position: relative;


    .song-name, .list-center {
      color: @pinkFont;
    }
  }

  .active-song:before {
    content: "\e60f";
    position: absolute;
    left: 0;
    color: @pinkFont;
    width: 0;
  }

  li {
    cursor: pointer;
    display: flex;
    line-height: 37px;
    font-size: 13px;
    height: 37px;
    padding: 0 20px;
    justify-content: space-between;

    .list-left {
      width: 180px;
      .long-text;
    }

    .list-right {
      color: @lightFontColor;
      .long-text;

    }

    .list-center {
      width: 100px;
      .long-text;
      color: @fontColor2;
    }

    .index {
      margin-right: 12px;
    }

    .song-name {
      color: @fontColor;

    }
  }

  li:nth-child(odd) {
    background-color: @shallowTheme;
  }

}
.top-control{
  display: flex;
  justify-content: space-between;
  padding-left: 18px;
  padding-right: 18px;
  .total{
    color: #b8b8b8;
    font-size: 12px;
  }
  .btn div{
    cursor:pointer;
    font-size: 13px;
color: #6586b2;
  }
}

</style>
