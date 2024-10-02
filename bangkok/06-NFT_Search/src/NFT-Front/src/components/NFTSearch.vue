<template>
  <div class="main">
    <el-row>
      <p class="title" style="margin-top: -10px; color: white">Search for NFTs</p>
    </el-row>
    <el-row>

      <el-col :span="10" style="margin-left: 50px">
        <div class="search-form">
          <div>
            <el-button :class="{ 'is-selected': typeText }" style="width: 300px" @click="changeType('text')" icon="el-icon-document"></el-button>
            <el-button :class="{ 'is-selected': typeImage }" style="width: 300px" @click="changeType('image')" icon="el-icon-picture-outline"></el-button>
          </div>

          <el-form ref="form" :model="form" label-width="180px" label-position="left" >
            <div v-if="typeText">
              <el-input class="query"
                        type="textarea"
                        clearable
                        resize="none"
                        style="width: 100%; margin-bottom: 20px; margin-top: 20px; margin-left: -40px"
                        rows="6" v-model="form.input_caption" placeholder="Enter your ideal image caption,as detailed as possible">
              </el-input>
            </div>
            <div v-if="typeImage">

              <el-upload
                  ref="uploadComponent"
                  class="upload"
                  v-model="form.image"
                  drag
                  limit="1"
                  :auto-upload="false"
                  name="input_img"
                  action="/api/img_global_search"
                  :on-change="handleFileSelect"
                  :on-remove="handleRemove"
                  :file-list="form.fileList"
                  style="width: 100%; margin-bottom: 20px; margin-top: 20px"
                  multiple>
                <img v-if="form.image" :src="form.image" class="avatar">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">Drop image here or click to upload</div>
              </el-upload>
              <video v-if="showCamera" ref="video" width="320" height="240" autoplay muted></video>
              <el-button v-if="!showCamera" icon="el-icon-camera" @click="init()"></el-button>
              <el-button v-if="showCamera"  icon="el-icon-camera" @click="takePhoto()"></el-button>
            </div>
            <el-form-item label="Select Processing Mode" >
              <el-radio-group v-model="form.mode">
                <el-radio label="txt-img"></el-radio>

                <el-radio v-if="typeImage" label="txt-txt" disabled ></el-radio>
                <el-radio v-else label="txt-txt"></el-radio>

                <el-radio v-if="typeText" label="img-img" disabled></el-radio>
                <el-radio v-else label="img-img"></el-radio>

                <el-radio label="max-prob"></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="Directed Search">
              <el-select v-model="form.nft_name" placeholder="All" style="width: 100%" clearable="true">
                <el-option v-for="name in NFT_name" :key="name" :value="name" ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>

            </el-form-item>
          </el-form>
          <el-button type="info" @click="onSubmit()" style="width: 100%">Search</el-button>
        </div>
      </el-col>
      <el-col :span="10">
        <p>Example</p>
        <div class="example">
          <div v-if="typeText" >
            <div @click="chooseText(example.text[0])">
              <el-input class="queryExample"
                        style="width: 80%; margin-bottom: 10px; "
                        type="textarea"
                        resize="none"
                        readonly
                        v-model="example.text[0]" >
              </el-input>
            </div>
            <div @click="chooseText(example.text[1])">
              <el-input class="queryExample"
                        style="width: 80%; margin-bottom: 10px; "
                        type="textarea"
                        resize="none"
                        readonly
                        v-model="example.text[1]" >
              </el-input>
            </div>
            <div @click="chooseText(example.text[2])">
              <el-input class="queryExample"
                        style="width: 80%;"
                        type="textarea"
                        resize="none"
                        readonly
                        rows="4"
                        v-model="example.text[2]">
              </el-input>
            </div>

          </div>
          <div v-if="typeImage">
            <div class="example-image-middle">
              <div>
                <img :src="example.image[0]" slot="reference" class="example-image" @click="exampleImgSubmit(example.image[0])"/>
                <img :src="example.image[1]" slot="reference" class="example-image" @click="exampleImgSubmit(example.image[1])"/>
              </div>
              <div>
                <img :src="example.image[2]" slot="reference" class="example-image" @click="exampleImgSubmit(example.image[2])"/>
                <img :src="example.image[3]" slot="reference" class="example-image" @click="exampleImgSubmit(example.image[3])"/>
              </div>
            </div>

          </div>
        </div>
      </el-col>
      <el-col :span="1">
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <p style="font-size: 20px; font-weight: bolder; text-align: left; color: white">Result</p>
      </el-col>
    </el-row>

    <div v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-row v-for="(info, i) in filteredItems" :key="i" style="margin-bottom: 20px" >
        <el-card>
          <el-col :span="4" >
            <div class="images">
              <div class="image-middle">
<!--                <el-card shadow="hover" :body-style="{ padding: '10px' }">-->
<!--                  &lt;!&ndash;                <el-popover>&ndash;&gt;-->
<!--                  &lt;!&ndash;                  <img :src="info[0].src" slot="reference" class="image"/>&ndash;&gt;-->
<!--                  &lt;!&ndash;                  <img :src="info[0].src" class="imagePreview"/>&ndash;&gt;-->
<!--                  &lt;!&ndash;                </el-popover>&ndash;&gt;-->

<!--                </el-card>-->
                <div style="text-align: center; padding-top: 12px">
                  <span style="color: white; font-size: 25px">{{ info[0].nft_name}}</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="20" >
            <div class="images" style="width: 100%; margin-left: -40px">
              <div v-for="(item, index) in info.slice(0, 6)" :key="index" class="image-middle">

                  <el-popover width="512">
                    <el-image :src="item.filepath" slot="reference" class="image"></el-image>
                    <el-image :src="item.filepath" class="imagePreview"></el-image>
                    <p>{{item.caption}}</p>
                  </el-popover>

                  <div style="text-align: center; padding-top: 12px">
                    <span style="color: white">{{'#' + item.token_ID}}</span>
                  </div>

              </div>
              <div v-for="(item, index) in info.slice(6, info.length)" v-show="shows[i]" :key="index" class="image-middle">

                  <el-popover width="512">
                    <el-image :src="item.filepath" slot="reference" class="image" ></el-image>
                    <el-image :src="item.filepath" class="imagePreview"></el-image>
                    <p>{{item.caption}}</p>
                  </el-popover>

                  <div style="text-align: center; padding-top: 12px">
                    <spanc style="color: white">{{'#' + item.token_ID}}</spanc>
                  </div>

              </div>
            </div>
          </el-col>
          <div style="float: right; margin-top: -150px" >
            <el-button v-if="!shows[i]" icon="el-icon-arrow-down" @click="showMore(i)"></el-button>
            <el-button v-if="shows[i]" icon="el-icon-arrow-up" @click="showMore(i)"></el-button>
          </div>
        </el-card>
      </el-row>

    </div>
  </div>
</template>

<script>
import {caption_global_search, caption_directed_search} from "@/api/ntfApi"
import image from "@/icons/svg/image.svg"
import text from "@/icons/svg/text.svg"
import axios from "axios";
// import axios from "axios";

export default {
  name: 'NFTSearch',
  props: {
    msg: String
  },
  data() {
    return {
      stream: null,
      showCamera: false,
      loading: false,
      example: {
        text: [
            "3D glasses",
            "haha",
            "A picture of ape, containing colorful Hat Bored Mouth Red Fur Silver Stud Earringsunglasses.black Sleeveless Clothes Orange Background."
        ],
        image: [
            "https://nft1000.oss-cn-beijing.aliyuncs.com/NFT1000/demo/mfers_x.png",
            "https://nft1000.oss-cn-beijing.aliyuncs.com/NFT1000/demo/Azuki.png",
            "https://nft1000.oss-cn-beijing.aliyuncs.com/NFT1000/demo/A大.png",
            "https://nft1000.oss-cn-beijing.aliyuncs.com/NFT1000/demo/Kirara.png"
        ]
      },
      icons: {
        image: image,
        text: text
      },
      shows: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false
      ],
      typeText: true,
      typeImage: false,
      form: {
        image: '',
        input_img: null,
        input_caption: '',
        mode: 'txt-img',
        nft_name: '',
        fileList: []
      },
      infos:[
      ],
      NFT_name: [
        "BoredApeYachtClub",
        "CRYPTOPUNKS",
        "MutantApeYachtClub",
        "Azuki",
        "CloneX",
        "Moonbirds",
        "Doodles",
        "BoredApeKennelClub",
        "Cool Cats",
        "Beanz",
        "PudgyPenguins",
        "Cryptoadz",
        "World Of Women",
        "CyberKongz",
        "0N1 Force",
        "MekaVerse",
        "HAPE PRIME",
        "mfers",
        "projectPXN",
        "Karafuru",
        "Invisible Friends",
        "FLUF",
        "Milady",
        "goblintown",
        "Phanta Bear",
        "CyberKongz VX",
        "KaijuKingz",
        "Prime Ape Planet",
        "Lazy Lions",
        "3Landers",
        "The Doge Pound",
        "DeadFellaz",
        "World Of Women Galaxy",
        "ALIENFRENS",
        "VOX Series 1",
        "Hashmasks",
        "Psychedelics Anonymous Genesis",
        "RENGA",
        "CoolmansUniverse",
        "Art Gobblers",
        "SupDucks",
        "Jungle Freaks",
        "Sneaky Vampire Syndicate",
        "SuperNormalbyZipcy",
        "Nakamigos",
        "Impostors Genesis",
        "Potatoz",
        "CryptoSkulls",
        "Moonbirds Oddities",
        "RumbleKongLeague",
        "MURI",
        "Galactic Apes",
        "Lives of Asuna",
        "My Pet Hooligan",
        "Murakami.Flowers",
        "Kiwami",
        "SHIBOSHIS",
        "Sappy Seals",
        "DEGEN TOONZ",
        "Killer GF",
        "CryptoMories",
        "Crypto Bull Society",
        "CryptoBatz by Ozzy Osbourne",
        "Quirkies",
        "Robotos",
        "Tubby Cats",
        "Chain Runners",
        "MutantCats",
        "Boss Beauties",
        "OnChainMonkey",
        "Rektguy",
        "Desperate ApeWives",
        "DigiDaigaku",
        "DeGods",
        "apekidsclub",
        "The Humanoids",
        "Sevens Token",
        "Akutars",
        "HypeBears",
        "KIA",
        "inbetweeners",
        "C-01 Official Collection",
        "Imaginary Ones",
        "ZombieClub Token",
        "Groupies",
        "Valhalla",
        "MOAR by Joan Cornella",
        "the littles NFT",
        "The Heart Project",
        "CryptoDads",
        "Chimpers",
        "Crypto Chicks",
        "WonderPals",
        "LilPudgys",
        "a KID called BEAST",
        "Akuma",
        "Cyber Snails",
        "Variant",
        "OKOKU",
        "Dodoor NFT",
        "Weirdo Ghost Gang"
      ]
    }
  },
  mounted() {

  },
  computed: {
    filteredItems() {
      // 过滤掉空列表
      return this.infos.filter(item => item.length > 0);
    }
  },
  methods: {
    async initCamera() {

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.$refs.video.srcObject = this.stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    },
    init() {
      this.showCamera = true
      this.initCamera()
    },
    takePhoto() {
      const canvas = document.createElement('canvas')
      canvas.width = this.$refs.video.videoWidth
      canvas.height = this.$refs.video.videoHeight
      canvas.getContext('2d').drawImage(this.$refs.video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob((blob) => {
        const imgFile = new File([blob], 'network-image.jpg', { type: 'image/jpeg' })
        console.log(imgFile)
        this.handleFileSelectPhoto(imgFile)
      }, 'image/jpeg');
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.$refs.video.srcObject = null;
        this.showCamera = false
      }
    },
    showMore(i) {
      this.$set(this.shows, i, !this.shows[i]);
    },
    exampleImgSubmit(imgUrl) {
      this.loading = true
      fetch(imgUrl)
          .then(response => response.blob())
          .then(blob => {
            const input_img = new File([blob], 'network-image.jpg', { type: 'image/jpeg' });
            var mode = this.form.mode
            let formData = new FormData()
            formData.append("input_img", input_img)
            formData.append("mode", mode)
            var nft_name =  this.form.nft_name
            if (nft_name === '') {
              axios.post("/api/img_global_search",  formData).then(res=> {
                this.infos = res.data
              }).finally(() => {
                this.loading = false
              })
            } else {
              formData.append("nft_name", nft_name)
              axios.post("/api/img_directed_search",  formData).then(res=> {
                this.infos = [res.data[0]]
              }).finally(() => {
                this.loading = false
              })
            }
          })
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    handleFileSelect(file) {
      console.log(file)
      this.form.input_img = file.raw
      console.log(file.raw)
      const reader = new FileReader();
      reader.onload = e => {
        this.resizeBase64Image(e.target.result, 360, 180).then((resizeBase64) => {
          this.form.image = resizeBase64;
        })

      };
      reader.readAsDataURL(file.raw);
    },

    handleFileSelectPhoto(file) {
      console.log(file)
      this.form.input_img = file
      console.log(file)
      const reader = new FileReader();
      reader.onload = e => {
        this.resizeBase64Image(e.target.result, 360, 180).then((resizeBase64) => {
          this.form.image = resizeBase64;
        })

      };
      reader.readAsDataURL(file);
    },
    handleRemove() {
      this.form.image = ""
    },
    onSubmit() {
      this.loading = true
      var mode = this.form.mode
      var nft_name =  this.form.nft_name
      var input_img = this.form.input_img
      if (input_img != null) {

        let formData = new FormData()
        console.log(input_img)
        formData.append("input_img", input_img)
        formData.append("mode", mode)
        if (nft_name === '') {
          axios.post("/api/img_global_search",  formData).then(res=> {
            this.infos = res.data
          }).finally(() => {
            this.loading = false
          })
        } else {
          formData.append("nft_name", nft_name)
          axios.post("/api/img_directed_search",  formData).then(res=> {
            this.infos = [res.data[0]]
          }).finally(() => {
            this.loading = false
          })
        }

      } else {

        // var image = this.form.image
        var input_caption =  this.form.input_caption

        if (input_caption !== "" ) {
          if (nft_name === "") {
            caption_global_search({ input_caption: input_caption, mode: mode}).then(data => {
              this.infos = data
            }).finally(() => {
              this.loading = false
            })
          }
          else {
            caption_directed_search({ input_caption: input_caption, mode: mode, nft_name: nft_name}).then(data => {
              this.infos = [data[0]]
            }).finally(() => {
              this.loading = false
            })
          }

        }
      }
    },
    changeType(typeFile) {
      console.log(typeFile)

      if (typeFile === 'text') {
        this.form = {
          image: '',
          input_img: null,
          input_caption: '',
          mode: 'txt-img',
          nft_name: '',
          fileList: []
        }
        this.typeText = true
        this.typeImage = false
      } else {
        this.form = {
          image: '',
          input_img: null,
          input_caption: '',
          mode: 'img-img',
          nft_name: '',
          fileList: []
        }
        this.typeText = false
        this.typeImage = true
      }
    },
    chooseText(text) {
      console.log(text)
      this.form.input_caption = text
    },
    resizeBase64Image(base64String, targetWidth, targetHeight) {
      return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = base64String
        image.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')
          ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
          const resizedBase64 = canvas.toDataURL(image.src.split(';')[0])
          resolve(resizedBase64);
        }
        image.onerror = reject;
      })
    },

  },


}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.title {
  font-weight: bolder;
  font-size: 20px;
}
.sub-title{

}
.query {
  /*position: fixed;*/
  left: 20px;
  width: 400px;

}


.is-selected {
  background-color: #d1d1e4;
  border-color: #409EFF;
}

.images{
  display: flex;
  margin-top: 20px;
  margin-left: 21px;
  margin-right: 20px;
  flex-wrap: wrap;
}

.image-middle{
  margin-right: 15px;
  margin-bottom: 15px;
}

.image{
  width: 230px;
  height: 230px;
  border-radius: 10px;
}

.example-image{
  width: 200px;
  height: 200px;
  margin-left: 50px;
  margin-bottom: 50px;
  border-radius: 10px;
}

.queryExample .el-input__inner {
  cursor: pointer !important;
}

.main {
  /*background-image: url('@/assets/bg2.jpg');*/
  /*background-size: cover;*/
  /*background-position: center;*/
  /* filter: invert(1) hue-rotate(180deg); */

}
</style>

