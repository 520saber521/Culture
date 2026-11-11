-- =====================================================
-- 文化遗产管理系统 - 示例数据插入脚本
-- =====================================================

USE cultural_db;

-- 先获取城市ID（假设已存在）
SET @nanjing_id = (SELECT id FROM city WHERE code = '320100' LIMIT 1);
SET @suzhou_id = (SELECT id FROM city WHERE code = '320500' LIMIT 1);
SET @wuxi_id = (SELECT id FROM city WHERE code = '320200' LIMIT 1);
SET @yangzhou_id = (SELECT id FROM city WHERE code = '321000' LIMIT 1);
SET @changzhou_id = (SELECT id FROM city WHERE code = '320400' LIMIT 1);
SET @zhenjiang_id = (SELECT id FROM city WHERE code = '321100' LIMIT 1);
SET @xuzhou_id = (SELECT id FROM city WHERE code = '320300' LIMIT 1);
SET @nantong_id = (SELECT id FROM city WHERE code = '320600' LIMIT 1);
SET @huaian_id = (SELECT id FROM city WHERE code = '320800' LIMIT 1);
SET @yancheng_id = (SELECT id FROM city WHERE code = '320900' LIMIT 1);
SET @lianyungang_id = (SELECT id FROM city WHERE code = '320700' LIMIT 1);
SET @taizhou_id = (SELECT id FROM city WHERE code = '321200' LIMIT 1);
SET @suqian_id = (SELECT id FROM city WHERE code = '321300' LIMIT 1);

-- 获取分类ID
SET @craft_id = (SELECT id FROM category WHERE code = 'traditional_craft' LIMIT 1);
SET @art_id = (SELECT id FROM category WHERE code = 'traditional_art' LIMIT 1);
SET @drama_id = (SELECT id FROM category WHERE code = 'traditional_drama' LIMIT 1);
SET @music_id = (SELECT id FROM category WHERE code = 'traditional_music' LIMIT 1);
SET @dance_id = (SELECT id FROM category WHERE code = 'traditional_dance' LIMIT 1);

-- =====================================================
-- 插入非遗数据
-- =====================================================

INSERT INTO `heritage` (`name`, `alias`, `category_id`, `category`, `city_id`, `city`, `description`, `content`, `cover_image`, `level`, `heritage_year`, `declarer`, `inheritor`, `origin_period`, `status`, `view_count`, `like_count`, `collect_count`, `is_recommend`, `is_hot`, `create_time`) VALUES
('昆曲', '昆山腔', @drama_id, '传统戏剧', @suzhou_id, '苏州', '昆曲是中国最古老的剧种之一，被称为"百戏之祖"，2001年被联合国教科文组织列为"人类口述和非物质遗产代表作"', '<h2>昆曲简介</h2><p>昆曲，原名"昆山腔"或简称"昆腔"，是中国最古老的剧种之一，也是中国传统文化艺术中的珍品，被称为"百戏之祖"。昆曲起源于14世纪中国的苏州昆山，后经魏良辅等人的改良而走向全国，自明代中叶以来独领中国剧坛近300年。</p><h3>艺术特色</h3><p>昆曲唱腔优美，委婉细腻，表演程式化，注重手势、眼神等细节。音乐伴奏以笛子为主，配以笙、琵琶等乐器。剧本文学性强，多取材于古典文学名著。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20traditional%20Chinese%20performance&image_size=landscape_16_9', 1, '2001年', '江苏省昆山市', '张继青、石小梅', '元末明初', 1, 35000, 2800, 1500, 1, 1, NOW()),

('南京云锦', '云锦', @craft_id, '传统技艺', @nanjing_id, '南京', '南京云锦是中国传统的丝织工艺瑰宝，因其色泽光丽灿烂，状如天上云霞而得名，被誉为"寸锦寸金"', '<h2>南京云锦简介</h2><p>南京云锦是中国传统的丝织工艺瑰宝，因其色泽光丽灿烂，状如天上云霞而得名。云锦与成都蜀锦、苏州宋锦、广西壮锦并称"中国四大名锦"，被誉为"寸锦寸金"。</p><h3>工艺特色</h3><p>云锦主要特点是逐花异色，通经断纬，挖花盘织。从纹样设计到成品，要经过纹样、挑花结本、原料准备、造机、织造等工序，其中织造由拽花、织手两人配合完成。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Yunjin%20brocade%20silk%20weaving&image_size=landscape_16_9', 1, '2009年', '江苏省南京市', '金文、周双喜', '元代', 1, 28000, 2100, 1200, 1, 1, NOW()),

('苏州评弹', '评弹', @music_id, '传统音乐', @suzhou_id, '苏州', '苏州评弹是苏州评话和弹词的总称，是运用苏州方言进行说唱的曲艺形式，被誉为"江南明珠"', '<h2>苏州评弹简介</h2><p>苏州评弹是苏州评话和弹词的总称，是运用苏州方言进行说唱的曲艺形式。它产生并流行于苏州及江、浙、沪一带，用苏州方言演唱。</p><h3>艺术特色</h3><p>评弹的表演通常由一至三人进行，说表细腻，演唱优美，深受江南地区群众的喜爱。评弹的唱腔流派众多，主要有陈调、俞调、蒋调、丽调等。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20Pingtan%20traditional%20Chinese%20storytelling&image_size=landscape_16_9', 1, '2006年', '江苏省苏州市', '邢晏春、邢晏芝', '明代', 1, 22000, 1800, 900, 1, 1, NOW()),

('宜兴紫砂陶制作技艺', '紫砂', @craft_id, '传统技艺', @wuxi_id, '无锡', '宜兴紫砂陶制作技艺是江苏省宜兴市特有的传统手工技艺，以紫砂壶为代表作品闻名于世', '<h2>宜兴紫砂简介</h2><p>宜兴紫砂陶制作技艺是江苏省宜兴市特有的传统手工技艺，以紫砂壶为代表作品闻名于世。紫砂泥料独特，透气性好，泡茶不失原味。</p><h3>工艺特色</h3><p>紫砂壶的制作需经过选泥、炼泥、打泥片、围身筒、制壶嘴、壶把、壶盖等工序，全靠手工完成。造型丰富，有光货、花货、筋囊货等类型。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yixing%20Zisha%20teapot%20purple%20clay%20ceramic&image_size=landscape_16_9', 1, '2006年', '江苏省宜兴市', '徐秀棠、汪寅仙', '北宋', 1, 25000, 2000, 1100, 1, 1, NOW()),

('扬州漆器髹饰技艺', '漆器', @craft_id, '传统技艺', @yangzhou_id, '扬州', '扬州漆器是中国传统漆器工艺的重要代表，以其精美的工艺和独特的艺术风格著称', '<h2>扬州漆器简介</h2><p>扬州漆器是中国传统漆器工艺的重要代表，以其精美的工艺和独特的艺术风格著称。扬州漆器历史悠久，品种繁多，技艺精湛。</p><h3>工艺特色</h3><p>扬州漆器主要有点螺、雕漆、雕漆嵌玉、刻漆、平磨螺钿、彩绘等工艺。其中点螺漆器最为珍贵，选用自然色彩的夜光螺、珍珠贝、玛瑙等材料，制成细薄片，拼接成各种图案。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20lacquerware%20Chinese%20traditional%20craft&image_size=landscape_16_9', 1, '2006年', '江苏省扬州市', '张宇、池家骏', '战国时期', 1, 18000, 1500, 800, 1, 0, NOW()),

('苏绣', '苏州刺绣', @art_id, '传统美术', @suzhou_id, '苏州', '苏绣是中国四大名绣之一，以针法精细、色彩雅丽著称，被誉为"绣中之绣"', '<h2>苏绣简介</h2><p>苏绣是中国四大名绣之一，以针法精细、色彩雅丽著称，被誉为"绣中之绣"。苏绣具有图案秀丽、构思巧妙、绣工细致、针法活泼、色彩清雅的独特风格。</p><h3>艺术特色</h3><p>苏绣的主要特点是针法精细，有齐针、抢针、套针、施针、虚实针等数十种针法。双面绣是苏绣的绝技，正反两面图案相同，针法一致。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20embroidery%20Su%20Xiu%20Chinese%20traditional%20art&image_size=landscape_16_9', 1, '2006年', '江苏省苏州市', '姚建萍、顾文霞', '春秋时期', 1, 32000, 2600, 1400, 1, 1, NOW()),

('扬州玉雕', '玉雕', @craft_id, '传统技艺', @yangzhou_id, '扬州', '扬州玉雕是中国玉雕工艺的重要流派，以其精湛的技艺和独特的艺术风格闻名于世', '<h2>扬州玉雕简介</h2><p>扬州玉雕是中国玉雕工艺的重要流派，以其精湛的技艺和独特的艺术风格闻名于世。扬州玉雕历史悠久，技艺精湛，尤以山子雕最为著名。</p><h3>工艺特色</h3><p>扬州玉雕以山子雕最为著名，善于利用玉石的天然形状和色彩，因材施艺，雕琢出山水、人物、花鸟等立体图案。代表作品有《大禹治水图》玉山等。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20jade%20carving%20traditional%20Chinese%20craft&image_size=landscape_16_9', 1, '2006年', '江苏省扬州市', '顾永骏、江春源', '汉代', 1, 15000, 1200, 600, 0, 0, NOW()),

('徐州香包', '香囊', @craft_id, '传统技艺', @xuzhou_id, '徐州', '徐州香包是江苏省徐州市的传统手工艺品，具有浓郁的民俗特色和文化内涵', '<h2>徐州香包简介</h2><p>徐州香包是江苏省徐州市的传统手工艺品，具有浓郁的民俗特色和文化内涵。香包内装多种芳香药材，外绣精美图案，既是装饰品，又有驱蚊避邪的功效。</p><h3>工艺特色</h3><p>徐州香包制作工艺精细，造型多样，有心形、圆形、菱形、蝴蝶形等。图案多为吉祥纹样，如龙凤呈祥、双喜临门、福寿双全等，色彩鲜艳，寓意美好。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xuzhou%20fragrant%20sachet%20Chinese%20traditional%20craft&image_size=landscape_16_9', 2, '2008年', '江苏省徐州市', '井秋红', '清代', 1, 12000, 900, 450, 0, 0, NOW()),

('常州梳篦', '梳篦', @craft_id, '传统技艺', @changzhou_id, '常州', '常州梳篦是江苏省常州市的传统手工艺品，以其精湛的制作工艺和独特的艺术风格著称', '<h2>常州梳篦简介</h2><p>常州梳篦是江苏省常州市的传统手工艺品，以其精湛的制作工艺和独特的艺术风格著称。常州梳篦历史悠久，素有"宫梳名篦"之称。</p><h3>工艺特色</h3><p>常州梳篦制作需经过选材、开齿、打磨、雕花、描金等72道工序。梳篦选用优质木材，齿质光滑，不伤发质。雕花工艺精湛，图案精美。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Changzhou%20comb%20traditional%20Chinese%20craft&image_size=landscape_16_9', 2, '2008年', '江苏省常州市', '邢粮', '晋代', 1, 10000, 800, 400, 0, 0, NOW()),

('镇江恒顺香醋酿制技艺', '香醋', @craft_id, '传统技艺', @zhenjiang_id, '镇江', '镇江恒顺香醋是江苏省镇江市的传统调味品，以其独特的酿造工艺和醇厚的口感闻名', '<h2>镇江香醋简介</h2><p>镇江恒顺香醋是江苏省镇江市的传统调味品，以其独特的酿造工艺和醇厚的口感闻名。镇江香醋色泽清亮，酸而不涩，香而微甜。</p><h3>工艺特色</h3><p>镇江香醋采用优质糯米为原料，经过酿酒、制醅、淋醋三大过程，40多道工序，历时60多天精制而成。具有"色、香、酸、醇、浓"的特点。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zhenjiang%20vinegar%20traditional%20Chinese%20brewing&image_size=landscape_16_9', 2, '2006年', '江苏省镇江市', '张林', '清代', 1, 20000, 1600, 850, 1, 0, NOW());

-- =====================================================
-- 插入传统艺术数据
-- =====================================================

INSERT INTO `traditional_art` (`name`, `alias`, `category_id`, `category`, `city_id`, `city`, `description`, `content`, `cover_image`, `origin_period`, `artist`, `art_form`, `status`, `view_count`, `like_count`, `collect_count`, `is_recommend`, `create_time`) VALUES
('苏州园林', '园林艺术', @art_id, '传统美术', @suzhou_id, '苏州', '苏州园林是中国古典园林的杰出代表，以拙政园、留园、网师园等为代表，被誉为"人间天堂"', '<h2>苏州园林简介</h2><p>苏州园林是中国古典园林的杰出代表，以拙政园、留园、网师园、环秀山庄等为代表。苏州园林以小巧精致、意境深远著称，被誉为"人间天堂"。</p><h3>艺术特色</h3><p>苏州园林讲究"咫尺之内再造乾坤"，以叠山理水、建筑花木为主要内容，追求诗情画意，体现了中国传统文化中"天人合一"的哲学思想。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20classical%20garden%20Chinese%20landscape&image_size=landscape_16_9', '春秋时期', '蒯祥、姚承祖', '园林艺术', 1, 45000, 3500, 2000, 1, NOW()),

('南京剪纸', '剪纸艺术', @art_id, '传统美术', @nanjing_id, '南京', '南京剪纸是江苏省南京市的传统民间艺术，以其精美的图案和细腻的刀法著称', '<h2>南京剪纸简介</h2><p>南京剪纸是江苏省南京市的传统民间艺术，以其精美的图案和细腻的刀法著称。南京剪纸历史悠久，题材广泛，风格独特。</p><h3>艺术特色</h3><p>南京剪纸以"花中有花、题中意、意中象"为特点，图案多为吉祥纹样，如喜鹊登梅、龙凤呈祥、福寿双全等。刀法细腻，线条流畅，造型生动。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20paper%20cutting%20Chinese%20traditional%20art&image_size=landscape_16_9', '明代', '张方林', '民间美术', 1, 18000, 1400, 700, 1, NOW()),

('无锡惠山泥人', '泥人', @art_id, '传统美术', @wuxi_id, '无锡', '无锡惠山泥人是江苏省无锡市的传统民间艺术，以其独特的造型和绚丽的色彩著称', '<h2>惠山泥人简介</h2><p>无锡惠山泥人是江苏省无锡市的传统民间艺术，以其独特的造型和绚丽的色彩著称。惠山泥人历史悠久，以"大阿福"最为著名。</p><h3>艺术特色</h3><p>惠山泥人分为"粗货"和"细货"两大类。"粗货"以吉祥喜庆为题材，造型夸张，色彩艳丽；"细货"以戏曲人物为题材，做工精细，神态逼真。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Wuxi%20Huishan%20clay%20figurine%20Chinese%20folk%20art&image_size=landscape_16_9', '明代', '喻湘涟、王南仙', '民间美术', 1, 16000, 1200, 600, 1, NOW()),

('扬州木偶戏', '木偶', @drama_id, '传统戏剧', @yangzhou_id, '扬州', '扬州木偶戏是江苏省扬州市的传统戏剧形式，以其精湛的操纵技艺和生动的表演著称', '<h2>扬州木偶戏简介</h2><p>扬州木偶戏是江苏省扬州市的传统戏剧形式，以其精湛的操纵技艺和生动的表演著称。扬州木偶戏历史悠久，是中国木偶艺术的重要流派。</p><h3>艺术特色</h3><p>扬州木偶戏以杖头木偶为主，表演细腻逼真，能完成穿衣、脱帽、拂袖、吐火等高难度动作。剧目丰富，既有传统戏，也有现代戏。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20puppet%20show%20Chinese%20traditional%20theater&image_size=landscape_16_9', '唐代', '华美霞、颜育', '木偶戏', 1, 12000, 900, 450, 0, NOW()),

('南通蓝印花布', '蓝印花布', @art_id, '传统美术', @nantong_id, '南通', '南通蓝印花布是江苏省南通市的传统印染工艺，以其古朴典雅的风格和浓郁的乡土气息著称', '<h2>南通蓝印花布简介</h2><p>南通蓝印花布是江苏省南通市的传统印染工艺，以其古朴典雅的风格和浓郁的乡土气息著称。蓝印花布历史悠久，是江南地区民间服饰的重要材料。</p><h3>艺术特色</h3><p>南通蓝印花布采用纯天然植物染料，以豆浆石灰为防染浆，手工印染而成。图案多为吉祥纹样，如凤穿牡丹、麒麟送子、福寿双全等。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nantong%20blue%20calico%20Chinese%20traditional%20textile&image_size=landscape_16_9', '宋代', '吴元新', '印染工艺', 1, 14000, 1100, 550, 0, NOW());

-- =====================================================
-- 插入历史名人数据
-- =====================================================

INSERT INTO `celebrity` (`name`, `alias`, `dynasty`, `dynasty_order`, `city_id`, `city`, `title`, `description`, `content`, `avatar`, `birth_year`, `death_year`, `birth_place`, `achievements`, `works`, `status`, `view_count`, `like_count`, `collect_count`, `create_time`) VALUES
('李白', '诗仙', '唐', 4, NULL, NULL, '唐代伟大的浪漫主义诗人', '李白，字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"', '<h2>李白简介</h2><p>李白（701年-762年），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。其诗风格豪放飘逸，想象丰富，语言流转自然，音律和谐多变。</p><h3>主要成就</h3><p>李白存世诗文千余篇，有《李太白集》传世。他的诗歌对后世产生了深远的影响，与杜甫并称"李杜"，是中国文学史上最伟大的诗人之一。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Li%20Bai%20Chinese%20poet%20tang%20dynasty%20portrait&image_size=portrait_4_3', 701, 762, '碎叶城', '["创作大量优秀诗篇", "开创浪漫主义诗风", "与杜甫并称李杜"]', '["《将进酒》", "《静夜思》", "《蜀道难》", "《望庐山瀑布》"]', 1, 50000, 4000, 2500, NOW()),

('苏轼', '东坡居士', '宋', 5, NULL, NULL, '北宋文学家、书画家', '苏轼，字子瞻，号东坡居士，北宋著名文学家、书画家，唐宋八大家之一', '<h2>苏轼简介</h2><p>苏轼（1037年-1101年），字子瞻，号东坡居士，北宋著名文学家、书画家。与其父苏洵、弟苏辙并称"三苏"，位列唐宋八大家。</p><h3>主要成就</h3><p>苏轼在诗、词、散文、书、画等方面都有很高成就。其词开豪放一派，与辛弃疾同是豪放派代表，并称"苏辛"；其散文著述宏富，豪放自如，与欧阳修并称"欧苏"。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Su%20Shi%20Chinese%20poet%20song%20dynasty%20portrait&image_size=portrait_4_3', 1037, 1101, '眉州眉山', '["开创豪放词派", "唐宋八大家之一", "书法宋四家之首"]', '["《念奴娇·赤壁怀古》", "《水调歌头·明月几时有》", "《赤壁赋》"]', 1, 42000, 3500, 2100, NOW()),

('徐霞客', '霞客', '明', 8, @nantong_id, '南通', '明代地理学家、旅行家', '徐霞客，名弘祖，字振之，号霞客，明代地理学家、旅行家，著有《徐霞客游记》', '<h2>徐霞客简介</h2><p>徐霞客（1587年-1641年），名弘祖，字振之，号霞客，南直隶江阴（今江苏江阴）人。明代地理学家、旅行家和文学家，他经30年考察撰成的60万字地理名著《徐霞客游记》，被誉为"千古奇人"。</p><h3>主要成就</h3><p>徐霞客一生游历考察三十余年，足迹遍及大半个中国。他的游记既是系统考察祖国地貌地质的地理名著，又是描绘华夏风景资源的旅游巨篇。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xu%20Xiake%20Chinese%20traveler%20geographer%20portrait&image_size=portrait_4_3', 1587, 1641, '江阴', '["开创实地考察地理学方法", "著有《徐霞客游记》", "被誉为千古奇人"]', '["《徐霞客游记》"]', 1, 28000, 2200, 1200, NOW()),

('吴承恩', '射阳山人', '明', 8, @huaian_id, '淮安', '明代小说家', '吴承恩，字汝忠，号射阳山人，明代小说家，著有《西游记》', '<h2>吴承恩简介</h2><p>吴承恩（约1500年-1582年），字汝忠，号射阳山人，淮安府山阳县（今江苏省淮安市淮安区）人。明代小说家，中国古典四大名著之一《西游记》的作者。</p><h3>主要成就</h3><p>吴承恩创作的《西游记》是中国古典神魔小说的巅峰之作，与《三国演义》《水浒传》《红楼梦》并称为中国古典四大名著，对后世文学产生了深远影响。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Wu%20Chengen%20Chinese%20writer%20Journey%20to%20the%20West%20author&image_size=portrait_4_3', 1500, 1582, '淮安山阳', '["创作《西游记》", "中国古典四大名著作者之一"]', '["《西游记》"]', 1, 35000, 2800, 1600, NOW()),

('郑板桥', '板桥', '清', 9, @yangzhou_id, '扬州', '清代书画家、文学家', '郑板桥，名燮，字克柔，号板桥，清代书画家、文学家，"扬州八怪"之一', '<h2>郑板桥简介</h2><p>郑板桥（1693年-1765年），名燮，字克柔，号板桥，江苏兴化人。清代著名书画家、文学家，"扬州八怪"之一，以"诗、书、画"三绝闻名于世。</p><h3>主要成就</h3><p>郑板桥擅长画兰、竹、石、松、菊等，尤以兰竹最为擅长。其书法以隶、楷、行三体相融，自创"六分半书"，别具一格。诗文真挚风趣，为世人所传诵。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Zheng%20Banqiao%20Chinese%20painter%20calligrapher%20portrait&image_size=portrait_4_3', 1693, 1765, '江苏兴化', '["扬州八怪之一", "诗书画三绝", "自创六分半书"]', '["《难得糊涂》", "《竹石图》", "《兰竹石图》"]', 1, 25000, 2000, 1100, NOW()),

('项羽', '西楚霸王', '秦', 3, @suqian_id, '宿迁', '秦末农民起义领袖', '项羽，名籍，字羽，秦末农民起义领袖，自称西楚霸王', '<h2>项羽简介</h2><p>项羽（公元前232年-公元前202年），名籍，字羽，下相（今江苏宿迁）人。秦末农民起义领袖，中国古代杰出军事家，自称西楚霸王。</p><h3>主要成就</h3><p>项羽是中国历史上最强的武将之一，古人对其有"羽之神勇，千古无二"的评价。他在巨鹿之战中消灭秦军主力，推翻秦朝统治，建立西楚政权。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Xiang%20Yu%20Chinese%20ancient%20warrior%20king%20portrait&image_size=portrait_4_3', -232, -202, '下相（今宿迁）', '["巨鹿之战大败秦军", "推翻秦朝统治", "建立西楚政权"]', '["《垓下歌》"]', 1, 32000, 2600, 1400, NOW());

-- =====================================================
-- 插入新闻数据
-- =====================================================

INSERT INTO `news` (`title`, `subtitle`, `category_id`, `category`, `summary`, `content`, `cover_image`, `author`, `source`, `status`, `is_top`, `is_hot`, `view_count`, `like_count`, `collect_count`, `publish_time`, `create_time`) VALUES
('2025年全国非遗文化展示活动在京举行', '传承千年匠心 展现文化魅力', NULL, '非遗动态', '本次活动展示了来自全国各地的非物质文化遗产项目，包括传统技艺、民间文学、传统音乐等多种类型，吸引了众多观众前来参观。', '<h2>活动盛况</h2><p>2025年全国非遗文化展示活动于3月18日在北京隆重举行。本次活动以"传承千年匠心，展现文化魅力"为主题，汇集了来自全国各地的非物质文化遗产项目。</p><p>展示活动包括传统技艺、民间文学、传统音乐、传统舞蹈、传统戏剧等多种类型，吸引了众多观众前来参观。</p><h3>江苏展区亮点</h3><p>江苏展区以"水韵江苏·匠心传承"为主题，展示了昆曲、苏绣、南京云锦、宜兴紫砂等国家级非遗项目，受到观众热烈欢迎。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20intangible%20cultural%20heritage%20exhibition&image_size=landscape_16_9', '文化记者', '中国文化报', 1, 1, 1, 23000, 1800, 900, NOW(), NOW()),

('苏州园林入选世界文化遗产30周年纪念活动', '园林之城 再谱华章', NULL, '文化交流', '苏州园林作为中国古典园林的杰出代表，于1997年被列入世界文化遗产名录。30周年纪念活动将举办系列文化展览和学术研讨会。', '<h2>纪念活动</h2><p>2027年是苏州园林入选世界文化遗产30周年。为纪念这一重要时刻，苏州市将举办系列文化展览和学术研讨会。</p><h3>活动内容</h3><p>纪念活动包括：苏州园林历史文献展、园林艺术国际学术研讨会、园林摄影大赛、园林文化体验活动等。届时将邀请国内外专家学者共话园林文化传承与发展。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Suzhou%20classical%20garden%20world%20heritage%20anniversary&image_size=landscape_16_9', '特约记者', '苏州日报', 1, 0, 1, 32000, 2500, 1300, NOW(), NOW()),

('南京云锦亮相巴黎时装周 展现东方美学', '传统工艺 走向世界', NULL, '文化交流', '南京云锦作为中国传统的丝织工艺瑰宝，首次亮相巴黎时装周，以独特的东方美学惊艳国际时尚舞台。', '<h2>巴黎时装周</h2><p>南京云锦作为中国传统的丝织工艺瑰宝，首次亮相巴黎时装周，以独特的东方美学惊艳国际时尚舞台，展现中华传统文化的魅力。</p><h3>展示亮点</h3><p>本次展示以"锦绣东方"为主题，展出了多件南京云锦精品，包括龙袍、凤冠、云锦礼服等。精湛的工艺和绚丽的色彩赢得了国际时尚界的高度赞誉。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Nanjing%20Yunjin%20brocade%20Paris%20fashion%20week&image_size=landscape_16_9', '时尚记者', '时尚芭莎', 1, 0, 1, 28000, 2200, 1100, NOW(), NOW()),

('AI技术助力传统文化创新发展', '科技赋能 文化传承', NULL, '非遗动态', '通过人工智能技术，传统文化元素得到了新的诠释和应用，为文化传承与创新注入了新的活力。', '<h2>科技与文化融合</h2><p>随着人工智能技术的快速发展，传统文化正在与新技术深度融合。AI技术在文化遗产保护、传统工艺创新、文化传播等方面发挥着越来越重要的作用。</p><h3>应用案例</h3><p>AI技术已应用于古籍数字化、文物修复、非遗传承人培训、文化创意产品设计等领域。通过AI技术，传统文化元素得到了新的诠释和应用，为文化传承与创新注入了新的活力。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20technology%20traditional%20culture%20innovation&image_size=landscape_16_9', '科技记者', '科技日报', 1, 0, 0, 18000, 1400, 700, NOW(), NOW()),

('江苏昆曲入选联合国非物质文化遗产名录', '百戏之祖 世界认可', NULL, '非遗动态', '昆曲是中国最古老的戏曲剧种之一，发源于江苏昆山，以其优美的唱腔和细腻的表演著称。', '<h2>昆曲艺术</h2><p>昆曲是中国最古老的戏曲剧种之一，发源于江苏昆山，以其优美的唱腔和细腻的表演著称。2001年，昆曲被联合国教科文组织列为"人类口述和非物质遗产代表作"，成为首批入选的非遗项目。</p><h3>传承保护</h3><p>近年来，江苏省高度重视昆曲艺术的传承与保护工作，建立了昆曲传习所、培养了大批年轻演员、整理了传统剧目、举办了昆曲艺术节等活动，使昆曲艺术焕发新的生机。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kunqu%20opera%20traditional%20Chinese%20performance&image_size=landscape_16_9', '文化记者', '中国文化报', 1, 0, 1, 35000, 2800, 1500, NOW(), NOW()),

('扬州漆器艺术展在国博开幕', '千年工艺 匠心传承', NULL, '文化交流', '扬州漆器是中国传统工艺的杰出代表，本次展览汇集了明清以来的珍贵漆器作品。', '<h2>展览盛况</h2><p>扬州漆器艺术展在中国国家博物馆隆重开幕。本次展览汇集了明清以来的珍贵漆器作品，展现了中国漆艺的精湛技艺和独特魅力。</p><h3>展品亮点</h3><p>展览共展出200余件漆器精品，包括点螺漆器、雕漆、雕漆嵌玉、刻漆等多种工艺类型。其中多件作品为国家一级文物，具有极高的艺术价值和历史价值。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Yangzhou%20lacquerware%20art%20exhibition%20museum&image_size=landscape_16_9', '艺术记者', '中国艺术报', 1, 0, 0, 15000, 1200, 600, NOW(), NOW()),

('非遗传承人群研修培训计划成果展开幕', '薪火相传 匠心筑梦', NULL, '非遗动态', '展示了江苏非遗传承人群研修培训计划的最新成果，包括传统技艺创新作品和传承经验分享。', '<h2>成果展示</h2><p>江苏非遗传承人群研修培训计划成果展在南京开幕。展览展示了研修培训计划的最新成果，包括传统技艺创新作品和传承经验分享。</p><h3>培训成果</h3><p>研修培训计划已成功举办多期，培训非遗传承人500余人次。学员们在传统技艺的基础上进行创新，创作出大量优秀作品，为非遗传承注入了新的活力。</p>', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20craft%20training%20workshop%20China&image_size=landscape_16_9', '教育记者', '江苏教育报', 1, 0, 0, 8562, 680, 340, NOW(), NOW());

-- =====================================================
-- 插入标签数据
-- =====================================================

INSERT INTO `tag` (`name`, `type`, `color`, `use_count`, `status`) VALUES
('国家级非遗', 'heritage', '#C00C00', 50, 1),
('省级非遗', 'heritage', '#FF6600', 30, 1),
('传统技艺', 'heritage', '#0099CC', 25, 1),
('传统美术', 'heritage', '#009966', 20, 1),
('传统戏剧', 'heritage', '#9933CC', 15, 1),
('世界遗产', 'art', '#CC3366', 40, 1),
('园林艺术', 'art', '#669900', 18, 1),
('民间艺术', 'art', '#FF9900', 22, 1),
('唐代诗人', 'common', '#336699', 10, 1),
('宋代文人', 'common', '#666699', 8, 1);

-- 更新城市统计数据
UPDATE city c SET 
    heritage_count = (SELECT COUNT(*) FROM heritage WHERE city_id = c.id AND deleted = 0),
    art_count = (SELECT COUNT(*) FROM traditional_art WHERE city_id = c.id AND deleted = 0),
    celebrity_count = (SELECT COUNT(*) FROM celebrity WHERE city_id = c.id AND deleted = 0);

SELECT '数据插入完成!' AS message;
