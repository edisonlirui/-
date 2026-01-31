const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const TopClient = require('./lib/api/topClient.js').TopClient

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

const DATA_DIR = path.join(__dirname, 'data')
const CONFIG_FILE = path.join(DATA_DIR, 'config.json')
const GOODS_FILE = path.join(DATA_DIR, 'goods.json')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR)
}

if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    taobaoApiUrl: '',
    taobaoAppKey: '',
    taobaoAppSecret: ''
  }, null, 2))
}

if (!fs.existsSync(GOODS_FILE)) {
  fs.writeFileSync(GOODS_FILE, JSON.stringify([], null, 2))
}

const getConfig = () => {
  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取配置失败', error)
    return {}
  }
}

const saveConfig = (config) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
    return true
  } catch (error) {
    console.error('保存配置失败', error)
    return false
  }
}

const getGoods = () => {
  try {
    const data = fs.readFileSync(GOODS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取商品数据失败', error)
    return []
  }
}

const saveGoods = (goods) => {
  try {
    fs.writeFileSync(GOODS_FILE, JSON.stringify(goods, null, 2))
    return true
  } catch (error) {
    console.error('保存商品数据失败', error)
    return false
  }
}

app.get('/api/config', (req, res) => {
  const config = getConfig()
  res.json({
    code: 0,
    data: {
      taobaoApiUrl: config.taobaoApiUrl || '',
      taobaoAppKey: config.taobaoAppKey || '',
      taobaoAppSecret: '***'
    }
  })
})

app.post('/api/config', (req, res) => {
  const { taobaoApiUrl, taobaoAppKey, taobaoAppSecret } = req.body
  const currentConfig = getConfig()
  
  const newConfig = {
    taobaoApiUrl: taobaoApiUrl || currentConfig.taobaoApiUrl,
    taobaoAppKey: taobaoAppKey || currentConfig.taobaoAppKey,
    taobaoAppSecret: taobaoAppSecret || currentConfig.taobaoAppSecret
  }
  
  const success = saveConfig(newConfig)
  
  if (success) {
    res.json({
      code: 0,
      msg: '保存成功'
    })
  } else {
    res.json({
      code: -1,
      msg: '保存失败'
    })
  }
})

app.get('/api/goods', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const goods = getGoods()
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = goods.slice(start, end)
  
  res.json({
    code: 0,
    data: {
      list,
      total: goods.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

app.get('/api/goods/hot', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const goods = getGoods()
  const hotGoods = goods.filter(item => item.isHot)
  
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = hotGoods.slice(start, end)
  
  res.json({
    code: 0,
    data: {
      list,
      total: hotGoods.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

app.post('/api/goods', (req, res) => {
  const goods = getGoods()
  const newGoods = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  }
  
  goods.unshift(newGoods)
  const success = saveGoods(goods)
  
  if (success) {
    res.json({
      code: 0,
      msg: '添加成功',
      data: newGoods
    })
  } else {
    res.json({
      code: -1,
      msg: '添加失败'
    })
  }
})

app.put('/api/goods/:id', (req, res) => {
  const { id } = req.params
  const goods = getGoods()
  const index = goods.findIndex(item => item.id === id)
  
  if (index === -1) {
    return res.json({
      code: -1,
      msg: '商品不存在'
    })
  }
  
  goods[index] = {
    ...goods[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  const success = saveGoods(goods)
  
  if (success) {
    res.json({
      code: 0,
      msg: '更新成功',
      data: goods[index]
    })
  } else {
    res.json({
      code: -1,
      msg: '更新失败'
    })
  }
})

app.delete('/api/goods/:id', (req, res) => {
  const { id } = req.params
  const goods = getGoods()
  const index = goods.findIndex(item => item.id === id)
  
  if (index === -1) {
    return res.json({
      code: -1,
      msg: '商品不存在'
    })
  }
  
  goods.splice(index, 1)
  const success = saveGoods(goods)
  
  if (success) {
    res.json({
      code: 0,
      msg: '删除成功'
    })
  } else {
    res.json({
      code: -1,
      msg: '删除失败'
    })
  }
})

const getTaobaoClient = () => {
  const config = getConfig()
  if (!config.taobaoAppKey || !config.taobaoAppSecret) {
    return null
  }
  return new TopClient({
    appkey: config.taobaoAppKey,
    appsecret: config.taobaoAppSecret,
    url: config.taobaoApiUrl || 'http://gw.api.taobao.com/router/rest'
  })
}

app.post('/api/coupon/search', async (req, res) => {
  const { type, keyword } = req.body
  const config = getConfig()
  
  if (!config.taobaoAppKey || !config.taobaoAppSecret) {
    return res.json({
      code: -1,
      msg: '请先配置淘宝API'
    })
  }
  
  const client = getTaobaoClient()
  
  try {
    let result
    
    if (type === 'link') {
      result = await new Promise((resolve, reject) => {
        client.execute('taobao.tbk.item.info.get', {
          num_iids: keyword,
          fields: 'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,volume,coupon_id,coupon_amount,coupon_start_time,coupon_end_time,coupon_remain_count,coupon_total_count,coupon_info'
        }, (error, response) => {
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        })
      })
    } else {
      result = await new Promise((resolve, reject) => {
        client.execute('taobao.tbk.item.get', {
          q: keyword,
          page_no: 1,
          page_size: 10,
          sort: 'tk_total_sales_des',
          fields: 'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,volume,coupon_id,coupon_amount,coupon_start_time,coupon_end_time,coupon_remain_count,coupon_total_count,coupon_info'
        }, (error, response) => {
          if (error) {
            reject(error)
          } else {
            resolve(response)
          }
        })
      })
    }
    
    if (result && result.n_tbk_item) {
      const item = Array.isArray(result.n_tbk_item) ? result.n_tbk_item[0] : result.n_tbk_item
      
      const couponPrice = item.zk_final_price ? (item.zk_final_price - (item.coupon_amount || 0)).toFixed(2) : item.zk_final_price
      
      res.json({
        code: 0,
        data: {
          id: item.num_iid,
          title: item.title,
          image: item.pict_url,
          price: parseFloat(item.zk_final_price || item.reserve_price || 0),
          originalPrice: parseFloat(item.reserve_price || 0),
          couponPrice: parseFloat(couponPrice),
          couponAmount: parseFloat(item.coupon_amount || 0),
          sales: parseInt(item.volume || 0),
          taobaoUrl: item.item_url || `https://detail.tmall.com/item.htm?id=${item.num_iid}`,
          couponInfo: item.coupon_info
        }
      })
    } else {
      res.json({
        code: -1,
        msg: '未找到相关商品'
      })
    }
  } catch (error) {
    console.error('查询失败', error)
    res.json({
      code: -1,
      msg: error.message || '查询失败，请检查API配置'
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Admin panel: http://localhost:${PORT}/admin.html`)
})