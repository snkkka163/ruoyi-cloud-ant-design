
const req = require.context('../../assets/icons/svg', false, /\.svg$/)
const requireAll = requireContext => requireContext.keys()

const re = /\.\/(.*)\.svg/

const icons = requireAll(req).map(i => {
  console.log('得到图标:')
  console.log(i)
  return i.match(re)[1]
})

export default icons
