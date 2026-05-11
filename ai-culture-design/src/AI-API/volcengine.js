// 火山引擎图像生成 API 调用封装

const VOLCENGINE_API_KEY = 'cdec8ece-fa6d-4fad-b9a6-6a2d3b0b6143';
const VOLCENGINE_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

const MIN_PIXELS = 3686400;
const VALID_SIZES = ['2048x2048', '1920x1920', '2560x1440', '1440x2560', '1920x1088', '1088x1920', '2304x1728', '1728x2304'];

function getValidSize(size) {
  if (VALID_SIZES.includes(size)) {
    return size;
  }
  const sizeMap = {
    '1K': '2048x2048',
    '2K': '2048x2048',
    '高清': '2048x2048',
    '竖版': '1440x2560',
    '横版': '2560x1440',
    '手机壁纸': '1088x1920',
    '电脑壁纸': '1920x1088',
    '方形': '2048x2048'
  };
  return sizeMap[size] || '2048x2048';
}

export async function generateImageWithVolcEngine(prompt, model = 'doubao-seedream-4-5-251128', size = '2048x2048', watermark = true) {
  const validSize = getValidSize(size);
  
  console.log('开始生成图像，参数:', { prompt, model, size: validSize, watermark });
  
  try {
    const requestBody = {
      model,
      prompt,
      size: validSize,
      response_format: 'url',
      watermark
    };
    
    console.log('API请求体:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(VOLCENGINE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VOLCENGINE_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('API响应状态:', response.status);
    console.log('API响应内容:', responseText);

    if (!response.ok) {
      let errorMessage = `API请求失败 (${response.status})`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = responseText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error('API返回数据格式异常: ' + JSON.stringify(data));
    }
    
    console.log('图像生成成功，URL:', data.data[0].url);
    return data.data[0].url;
    
  } catch (error) {
    console.error('火山引擎 API 调用失败详情:', {
      error: error.message,
      stack: error.stack,
      prompt,
      model,
      size: validSize
    });
    throw error;
  }
}

export async function generateJiangsuCultureImage(culturalElement, style = '中国风', size = '2048x2048') {
  const stylePrompts = {
    '中国风': '中国传统绘画风格，水墨意境，古典韵味',
    '水墨风格': '水墨画风格，意境深远，笔墨淋漓',
    '现代简约': '现代简约设计风格，简洁大方，时尚前卫',
    '复古风格': '复古怀旧风格，年代感强，经典韵味',
    '未来科技': '未来科技感风格，赛博朋克，霓虹光影',
    '卡通可爱': '卡通可爱风格，色彩明亮，童趣十足',
    '油画风格': '油画艺术风格，笔触厚重，色彩浓郁',
    '扁平化': '扁平化设计风格，简洁图形，现代感强',
    '传统风格': '传统文化风格，古典元素，民族特色'
  };
  
  const styleDesc = stylePrompts[style] || stylePrompts['中国风'];
  const prompt = `${culturalElement}，${styleDesc}，高清画质，精细细节，艺术作品，专业摄影`;
  
  console.log('生成江苏文化图像:', { culturalElement, style, prompt });
  
  return await generateImageWithVolcEngine(prompt, 'doubao-seedream-4-5-251128', size);
}

/**
 * 生成文化设计的文本描述
 * @param {string} culturalElement - 文化元素
 * @param {string} style - 设计风格
 * @param {string} purpose - 设计用途
 * @returns {Promise<string>} - 生成的文本描述
 */
export async function generateCultureDesign(culturalElement, style = '中国风', purpose = '海报') {
  // 由于火山引擎API主要用于图像生成，这里创建一个模拟函数
  // 返回预设的文化设计文本描述
  const descriptions = {
    '海报': `江苏${culturalElement}主题海报设计，采用${style}风格，融合传统元素与现代设计理念。画面中心展示${culturalElement}的核心元素，周围配以江苏特色的装饰图案，色彩以红色和金色为主，体现传统文化的喜庆与庄重。整体布局平衡，视觉冲击力强，适合作为文化宣传用途。`,
    '标志': `江苏${culturalElement}主题标志设计，采用${style}风格，简洁明快，易于识别。标志以${culturalElement}的典型元素为基础，进行抽象化处理，形成独特的视觉符号。色彩搭配和谐，既体现传统文化特色，又具有现代感。适合作为文化品牌的视觉标识。`,
    '插画': `江苏${culturalElement}主题插画设计，采用${style}风格，细腻生动，富有故事性。插画描绘了${culturalElement}的典型场景，人物形象饱满，场景细节丰富，色彩搭配协调，营造出浓厚的文化氛围。适合作为文化书籍、杂志的插图使用。`,
    '包装': `江苏${culturalElement}主题包装设计，采用${style}风格，美观实用，富有文化内涵。包装以${culturalElement}的元素为装饰，色彩搭配和谐，材质选择考究，既保护产品，又能传达文化信息。适合作为文化产品的包装使用。`
  };
  
  return descriptions[purpose] || `江苏${culturalElement}主题${purpose}设计，采用${style}风格，融合传统与现代元素，体现江苏文化的独特魅力。`;
}
