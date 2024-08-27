<!--Personal Page-->
<template>
  <div class="content-view">
    <el-backtop/>
    <div class="top">
      <el-avatar v-if="userDetail" :size="200" :src="userDetail.profile.avatarUrl"></el-avatar>
      <el-avatar v-else :size="200" :src="avatarImg"></el-avatar>
      <div class="info">
        <div class="name">
          <span class="font-weight">{{ userDetail.profile.nickname }}</span>
          <div class="tag-info">
            <!--             Singer Certification Tag-->
            <div class="tags">
              <!--            TODO: Reprocess here, analyze which field to take-->
              <div
                  v-if="userDetail.profile?.mainAuthType?.desc.length>1"
                  class="attestation">
                <img alt="" src="@/assets/img/attestation.png">
                <span>  {{
                    userDetail.profile?.mainAuthType?.desc
                  }}</span>
                <span
                    v-for="v in  userDetail.profile?.mainAuthType.tags"
                    v-if="userDetail.profile?.mainAuthType.tags">
                、{{ v }}
              </span>

              </div>
              <div>
                <i class="level">Lv{{ userDetail.level }}</i>
                <div class="gender">
                  <!--0 Not Specified, 1 Male, 2 Female-->
                  <el-icon v-show="userDetail.profile.gender===2">
                    <Female/>
                  </el-icon>
                  <el-icon v-show="userDetail.profile.gender===1">
                    <Male/>
                  </el-icon>
                </div>
              </div>
            </div>
            <div class="btn">
              <!--              <button-->
              <!--                  v-if="userDetail.profile.artistId"-->
              <!--                  class="white-btn"-->
              <!--                  @click="toArtist">-->
              <!--                <img alt="" src="@/assets/img/microphone.png" style="width: 20px;height: 20px; ">-->
              <!--                Artist Page-->
              <!--              </button>-->


              <div

                  class="followed"
                  @click="handleFollow"
              >
                <!--              Personal Homepage-->
                <button
                    v-if="userStore.accountInfo?.userId==userDetail?.profile?.userId"
                    class="white-btn" style="padding-left: 20px;"
                    @click.stop="handleLogout">
                  <img alt=""
                       src="@/assets/img/logout.jpg"
                       style="width: 13px;height: 14px;margin-right: 2px;margin-top: -2px;">

                  Logout
                </button>
                <button v-if="userDetail.profile.followMe&&userDetail.profile.followed" class="white-btn">
                  <el-icon>
                    <Switch/>
                  </el-icon>
                  Mutual Follow
                </button>
                <button v-else-if="userDetail.profile.followed" class="white-btn">
                  <el-icon>
                    <Check/>
                  </el-icon>
                  Followed
                </button>
                <button
                    v-else-if="!userDetail.profile.followed&&userStore.accountInfo?.userId!==userDetail?.profile?.userId"
                    class="white-btn">
                  <el-icon class="plus-icon">
                    <Plus/>
                  </el-icon>
                  Follow
                </button>

              </div>
            </div>

          </div>
        </div>
        <ul class="data">
          <li >
            <span @click="handleUserEvent">{{ userDetail.profile.eventCount }}</span>
            <span @click="handleUserEvent">Events</span>
          </li>
          <li>
            <span @click="handleFollows ">{{ userDetail.profile.follows }}</span>
            <span @click="handleFollows ">Following</span>
          </li>
          <li>
            <span @click="handleFolloweds">{{ userDetail.profile.followeds }}</span>
            <span @click="handleFolloweds">Followers</span>
          </li>
        </ul>
        <div class="attribute">
          <span>User ID: {{ userDetail.profile?.userId }}</span>
          <span>Birthday: {{ birthday }}</span>
          <span style="display: flex;"><span style="">Bio:</span>
            <TextCollapse :text="userDetail?.profile?.signature"></TextCollapse>

        </span>
        </div>

      </div>
    </div>
    <div class="tabs">
      <el-tabs v-model="activeName">
        <el-tab-pane :name="1" label="Created Albums">

        </el-tab-pane>
        <el-tab-pane :name="2" label="Favorite Playlists">
        </el-tab-pane>
      </el-tabs>
      <SongCard  v-if="activeName==1" :dropdownRefresh="false" :loading="loading" :playList="createList" type="playList"
                @loadData="loadData"></SongCard>
      <SongCard v-if="activeName==2" :dropdownRefresh="false" :loading="loading" :playList="collectList" type="playList"
                @loadData="loadData"></SongCard>

    </div>
    <!--Unfollow User Confirmation Dialog-->
    <el-dialog
        v-model="followVisible"
        title="Unfollow"
        width="400px"
    >
      <span>Are you sure you want to unfollow this friend?</span>
      <template #footer>
      <span class="dialog-footer">
        <button class="pink-btn" @click="followVisible = false">Continue Following</button>
        <button class="white-btn" @click="followUser">Unfollow</button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import SongCard from "@/components/Card/SongCard/index.vue"
import TextCollapse from '@/components/TextCollapse/index.vue'
import {ref, reactive, watch} from "vue"
import {useRoute, useRouter} from "vue-router"
import {getUserDetail, getUserPlaylist, userFollow} from "@/api/user/index"
import {useUser} from '@/store/user'
import {useTimestampFormat} from '@/hooks/useTimestampFormat'
import avatarImg from '@/assets/img/avatar.png'
import {Female, Male, Plus, Check, Switch} from '@element-plus/icons-vue'
import {usePlaylist} from '@/hooks/usePlaylist'
import type {PlaylistInfo} from '@/types/playlist.d.ts'
import {artistDetail} from "../../api/artist";
import {logout} from "../../api/login";
import {ElMessage} from 'element-plus'
import {useArtistInfo} from "../../hooks/useArtistInfo";

// Variables
let loading = ref(false)
const route = useRoute()
const router = useRouter()
const userStore = useUser()
const followVisible = ref(false)// Unfollow confirmation dialog control
let queryParams = reactive({
  uid: 0,
  limit: 30,
  offset: 0//   (page -1)*30, where 30 is the value of limit, default is 0
})
let userDetail = reactive<PersonalDetail>({
  level: 0,
  profile: {
    "userId": 0,
    "birthday": 0,
    "nickname": '',
    "avatarUrl": '',
    "gender": 0,
    "followed": false,
    "signature": '',
    "followeds": 0,
    "follows": 0,
    "eventCount": 0,
    "playlistCount": 0,
  }
})
const activeName = ref(1)
let birthday = ref('')
let createList = ref([]) //Created playlists
let collectList = ref([]) //Favorite playlists
let followQuery = reactive({ //Follow user request parameters
  t: <0 | 1>0,//0 Unfollow, 1 Follow
  id: route.query.uid//User ID
})

// Methods
// Logout for the current user
const handleLogout = async () => {
  let res = await logout()
  if (res.code === 200) {
    await userStore.clearAccount()
    ElMessage('Logout successful~(´▽`)ﾉ')
  }
}
// Get user details
const getDetail = () => {
  getUserDetail({uid: route.query.uid}).then((res: PersonalDetail) => {
    if (res.code === 200) {
      userDetail.level = res.level
      userDetail.profile = res.profile
      console.log('Personal details', res)
      birthday.value = useTimestampFormat(res.profile.birthday)
      getPlaylist()
    }
  })
}
getDetail()
// Get user playlist information
const getPlaylist = () => {
  queryParams.uid = route.query.uid
  loading.value = true
  getUserPlaylist(queryParams).then((res: any) => {
    loading.value = false
    // Distinguish which are created playlists and which are collected (have a creator attribute, which records the playlist creator's information, including the nickname attribute, which records the creator's name)
    let playlist = usePlaylist(res.playlist, userDetail.profile.nickname)

    createList.value.push(...playlist.createList)
    collectList.value.push(...playlist.collectList)
  })
}
// Navigate to the user events page
const handleUserEvent =()=>{
  router.push({
    name: 'userEvent',
    query: {
      info:JSON.stringify(userDetail.profile)

    }
  })
}
// Navigate to the following page
const handleFollows = () => {

  router.push({
    name: 'follows',
    query: {
      uid: userDetail.profile?.userId,
      userName: userDetail.profile.nickname,
      follows: userDetail.profile.follows
    }
  })
}
// Load more data for created albums
const loadData = () => {
  if (collectList.value.length > 0 || createList.value.length > 0) {
    queryParams.offset += 30
  }
  getPlaylist()
}
// Navigate to the artist page
const toArtist = async (v) => {
  // Artist information
  let info = await useArtistInfo(v)
  await router.push({
    name: 'artistDetail',
    query: {
      info: JSON.stringify(info)
    }
  })
}
// Navigate to the followers page
const handleFolloweds = () => {
  router.push({
    name: 'followeds',
    query: {
      uid: userDetail.profile?.userId,
      userName: userDetail.profile.nickname,
      followeds: userDetail.profile.followeds
    }
  })
}
// Clicked follow/unfollow user
const handleFollow = () => {
  // Show confirmation dialog for unfollow, but not for follow
  if (userDetail.profile.followed) {
    followVisible.value = true
  } else {
    followUser()
  }
}
// Initiate follow/unfollow request
const followUser = () => {
  followVisible.value = false
  followQuery.t = userDetail.profile.followed ? 0 : 1
  userFollow(followQuery).then((res: any) => {
    if (res.code === 200) {
      userDetail.profile.followed = !userDetail.profile.followed
    }
  })
}
// Watch for changes in the login status in the store
watch(() => userStore.accountInfo, (newVal: object) => {
  getPlaylist()
})

</script>

<style lang="less" scoped>
.content-view {
  height: calc(100% - 58px);
}

.el-avatar {
  min-width: 200px;
}

.top {
  display: flex;
  margin-bottom: 30px;

  .info {
    width: 100%;
    margin-left: 20px;
    display: flex;
    flex-direction: column;

    .name {
      padding-bottom: 15px;
      width: 100%;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid @lightTheme;

      .font-weight {
        font-size: 26px;
      }

      .tag-info {
        display: flex;
        width: 100%;
        justify-content: space-between;
        font-size: 12px;

        .btn {
          display: flex;

        }

        .tags {
          display: flex;
        }

        .attestation {
          display: inline-block;
          line-height: 16px;
          height: 18px;
          text-align: center;
          background-color: #fde4e2;
          color: #ed4036;
          border-radius: 8px;
          margin-top: 17px;
          margin-right: 10px;

          span:last-child {
            padding-right: 10px;
          }

          img {
            margin-right: 5px;
            width: 15px;
            height: 15px;
          }
        }

        .plus-icon {
          color: @pinkFont;
        }

        .followed {
          .white-btn {
            margin-bottom: -4px;
            position: relative;
            padding-left: 30px;
          }

          .el-icon {
            left: 13px;
            top: 9px;
            position: absolute;
            font-size: 14px;
            display: inline-block;
          }
        }

        .gender {
          display: inline-block;
          margin-left: 10px;
          margin-top: 16px;
          line-height: 16px;
          text-align: center;

          :deep(.el-icon) {
            font-size: 13px;
            border-radius: 50%;
            width: 16px;
            height: 16px;
          }

          :deep(.el-icon:first-child) {
            color: @pinkFont;
            background-color: @pink;
          }

          :deep(.el-icon:last-child) {
            color: #359ccf;
            background-color: #bff3ff;
          }
        }

        .level {
          display: inline-block;
          height: 18px;
          //width: 30px;
          border-radius: 30px;
          padding-left: 5px;
          padding-right: 5px;
          text-align: center;
          line-height: 18px;
          font-size: 12px;
          background-color: @pink;
          margin-top: 15px;
        }
      }
    }

    .data {
      display: flex;

      li:last-child {
        padding-left: 10px;
      }
      li:first-child {
      text-align: left;
        width: 65px;
      }

      li {

        //background-color: red;
        text-align: center;
        margin-top: 15px;
        border-right: 1px solid @lightTheme;
        width: 80px;
        height: 50px;
        display: flex;
        flex-direction: column;
        font-size: 20px;

        span:last-child {
          font-size: 13px;
          color: @fontColor2;
        }

        span:first-child {
          cursor: pointer;
        }
      }

      li:last-child {
        border: 0;
      }



    }

    .attribute {
      margin-top: 5px;
      display: flex;
      flex-direction: column;
      color: @fontColor2;
      font-size: 13px;
      line-height: 20px;
    }
  }
}

.label {
  margin-top: 30px;
  margin-bottom: 10px;
}

.el-tabs {
  left: 0px;
  padding-top: 10px;
  position: relative;
  background-color: #fff;
  width: 100%;
  z-index: 999;
  //margin-top: -8px;
}

:deep(.el-tabs__item.is-active) {
  .font-weight
}

:deep(.el-tabs__item) {
  font-size: 16px;
  color: @fontColor;
}

/*Remove the underline from the tabs*/
:deep(.el-tabs__nav-wrap:after) {
  position: static !important;
}

:deep(.el-tabs__active-bar) {
  transition: none;
  height: 3px;

}

:deep(.el-tabs__header) {
  margin: 0;
  //margin-bottom: 30px;
}

:deep(.el-avatar) {
  border: 1px solid #e7e2e2;
}
</style>
