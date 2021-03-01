<template>
  <a-list
    size="large"
    rowKey="id"
    :loading="loading"
    itemLayout="vertical"
    :dataSource="data"
  >
    <a-list-item :key="item.id" slot="renderItem" slot-scope="item">
      <template slot="actions">
        <icon-text type="star-o" :text="item.star" />
        <icon-text type="like-o" :text="item.like" />
        <icon-text type="message" :text="item.message" />
      </template>
      <a-list-item-meta>
        <a slot="title" href="https://vue.ant.design/">{{ item.title }}</a>
        <template slot="description">
          <span>
            <a-tag>Ant Design</a-tag>
            <a-tag>设计语言</a-tag>
            <a-tag>蚂蚁金服</a-tag>
          </span>
        </template>
      </a-list-item-meta>
      <article-list-content :description="item.description" :owner="item.owner" :avatar="item.avatar" :href="item.href" :updateAt="item.updatedAt" />
    </a-list-item>
    <div slot="footer" v-if="data.length > 0" style="text-align: center; margin-top: 16px;">
      <a-button @click="loadMore" :loading="loadingMore">加载更多</a-button>
    </div>
  </a-list>
</template>

<script>
import { ArticleListContent } from '@/components'
import IconText from './modules/IconText'
import { article } from '@/mock/services/article'
export default {
  name: 'Article',
  components: {
    IconText,
    ArticleListContent
  },
  data () {
    return {
      loading: true,
      loadingMore: false,
      data: []
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    getList () {
      const json = {
        'url': '?'
      }
      this.data = article(json).result
      this.loading = false
    },
    loadMore () {
      this.loadingMore = true
      const json = {
        'url': '?'
      }
      this.data = this.data.concat(article(json).result)
      this.loadingMore = false
    }
  }
}
</script>

<style scoped>

</style>
