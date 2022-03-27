export const COMMENT_LENGTH = 800;
export const TREE_ROOT_NODE_KEY = 'root';
export const MAX_POST_CATEGORY_NUMBER = 5;
export const MAX_POST_TAG_NUMBER = 20;

export const POST_STATUS: Record<string, string> = Object.freeze({
  publish: '公开',
  password: '加密',
  private: '隐藏',
  draft: '草稿',
  'auto-draft': '自动保存草稿',
  trash: '已删除'
});

export const COMMENT_FLAG: Record<string, string> = Object.freeze({
  open: '允许',
  verify: '审核',
  close: '禁止'
});

export const COPYRIGHT_TYPE: Record<string, string> = Object.freeze({
  '0': '禁止转载',
  '1': '转载需授权',
  '2': 'CC-BY-NC-ND'
});

export const COMMENT_STATUS: Record<string, string> = Object.freeze({
  normal: '正常',
  pending: '待审',
  reject: '驳回',
  spam: '垃圾评论',
  trash: '已删除'
});

export const COMMENT_STATUS_LIST = Object.freeze(Object.keys(COMMENT_STATUS).map((item) => ({
  key: item,
  label: COMMENT_STATUS[item]
})));

export const TAXONOMY_STATUS: Record<number, string> = Object.freeze({
  0: '不公开',
  1: '公开',
  2: '已删除'
});

export const LINK_VISIBLE: Record<string, string> = Object.freeze({
  site: '全站',
  homepage: '首页',
  invisible: '不可见'
});

export const LINK_TARGET: Record<string, string> = Object.freeze({
  _blank: '新页面',
  _top: '父页面',
  _self: '当前页'
});
