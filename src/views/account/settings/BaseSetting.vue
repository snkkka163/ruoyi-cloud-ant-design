<template>
  <div class="account-settings-info-view">
    <a-row :gutter="16">
      <a-col :md="24" :lg="16">

        <a-form layout="vertical">
          <a-form-item
            label="昵称"
          >
            <a-input :value="name" v-model="userObj.nickName" />
          </a-form-item>

          <a-form-item
            label="手机号码"
            :required="false"
          >
            <a-input :value="phonenumber" v-model="userObj.phonenumber" />
          </a-form-item>

          <a-form-item
            label="邮箱"
            :required="false"
          >
            <a-input :value="email" v-model="userObj.email" />
          </a-form-item>

          <a-form-item
            label="性别"
            :required="false"
          >
            <a-radio-group v-model="userObj.sex">
              <a-radio :value="'1'" >
                男
              </a-radio>
              <a-radio :value="'2'" >
                女
              </a-radio>
            </a-radio-group>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="updateUser">提交</a-button>
            <a-button style="margin-left: 8px">保存</a-button>
          </a-form-item>
        </a-form>

      </a-col>
      <a-col :md="24" :lg="8" :style="{ minHeight: '180px' }">
        <div class="ant-upload-preview" @click="$refs.modal.edit(1)" >
          <a-icon type="cloud-upload-o" class="upload-icon"/>
          <div class="mask">
            <a-icon type="plus" />
          </div>
          <img :src="avatar" />
        </div>
      </a-col>

    </a-row>

    <avatar-modal ref="modal" @ok="setavatar"/>
  </div>
</template>

<script>
import AvatarModal from './AvatarModal'
import { mapState } from 'vuex'
import { profile } from '@/api/system/user'
import store from '@/store'
export default {
  components: {
    AvatarModal
  },
  data () {
    return {
      // cropper
      preview: {},
      option: {
        img: '/avatar2.jpg',
        info: true,
        size: 1,
        outputType: 'jpeg',
        canScale: false,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 180,
        autoCropHeight: 180,
        fixedBox: true,
        // 开启宽度和高度比例
        fixed: true,
        fixedNumber: [1, 1],
        sex: 1
      },
      userObj: {
        userId: 0,
        nickName: '',
        sex: '',
        phonenumber: '',
        email: ''
      }
    }
  },
  methods: {
    setavatar (url) {
      this.option.img = url
    },
    updateUser () {
      profile(this.userObj).then(res => {
        // 在此处需要重置state以保证页面数据准确性
        store
          // 重置state
          .dispatch('GetInfo')
        this.$message.success('操作成功！')
      })
    }
  },
  computed: {
    ...mapState({
      name: (state) => state.user.name,
      avatar: (state) => state.user.avatar,
      sex: (state) => state.user.sex,
      email: (state) => state.user.email,
      phonenumber: (state) => state.user.phonenumber,
      userId: (state) => state.user.userId
    })
  },
  created () {
    this.userObj.nickName = this.name
    this.userObj.sex = this.sex
    this.userObj.email = this.email
    this.userObj.phonenumber = this.phonenumber
    this.userObj.userId = this.userId
  }
}
</script>

<style lang="less" scoped>

  .avatar-upload-wrapper {
    height: 200px;
    width: 100%;
  }

  .ant-upload-preview {
    position: relative;
    margin: 0 auto;
    width: 100%;
    max-width: 180px;
    border-radius: 50%;
    box-shadow: 0 0 4px #ccc;

    .upload-icon {
      position: absolute;
      top: 0;
      right: 10px;
      font-size: 1.4rem;
      padding: 0.5rem;
      background: rgba(222, 221, 221, 0.7);
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.2);
    }
    .mask {
      opacity: 0;
      position: absolute;
      background: rgba(0,0,0,0.4);
      cursor: pointer;
      transition: opacity 0.4s;

      &:hover {
        opacity: 1;
      }

      i {
        font-size: 2rem;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -1rem;
        margin-top: -1rem;
        color: #d6d6d6;
      }
    }

    img, .mask {
      width: 100%;
      max-width: 180px;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    }
  }
</style>
