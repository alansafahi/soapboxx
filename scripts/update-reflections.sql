-- Update Chronological Bible Order reading plan reflections with contextual questions
-- This script replaces generic reflection questions with scripture-specific ones

UPDATE reading_plan_days 
SET reflection_question = CASE scripture_reference
    -- Peace & Trust
    WHEN 'Psalm 46:10' THEN 'What makes it hard for you to "be still" before God? How can you create space today to simply know that He is God?'
    WHEN 'Hebrews 11:1' THEN 'What is God asking you to have faith for that you cannot yet see? How does this definition of faith challenge your perspective?'
    WHEN 'Proverbs 3:5-6' THEN 'In what areas are you tempted to lean on your own understanding? How can you practically acknowledge God in all your ways?'
    WHEN 'Romans 10:17' THEN 'How has hearing God''s Word strengthened your faith recently? What steps can you take to hear from Him more regularly?'
    WHEN 'Mark 11:22-24' THEN 'What do you need to believe God for today? How does Jesus'' teaching on prayer challenge your expectations?'
    
    -- Joy & Gratitude  
    WHEN 'Psalm 118:24' THEN 'What would change if you truly saw today as a gift from the Lord? How can you choose to rejoice in this specific day?'
    WHEN 'Nehemiah 8:10' THEN 'Where do you need God''s strength most right now? How does "the joy of the Lord" serve as strength in your life?'
    WHEN 'Philippians 4:4' THEN 'What makes it hard to rejoice when facing difficulties? How can you find reasons to celebrate God even in tough times?'
    
    -- Character & Growth
    WHEN 'James 1:2-4' THEN 'What trials are you facing that could develop perseverance in you? How does viewing trials as "pure joy" change your perspective?'
    WHEN 'Ephesians 2:10' THEN 'What "good works" do you sense God has prepared specifically for you to walk in? How does knowing you are His "workmanship" change how you see yourself?'
    WHEN 'Jeremiah 29:11' THEN 'What fears about the future are you holding onto? How can trusting God''s "plans to prosper you" bring hope to your current situation?'
    WHEN 'Romans 8:28' THEN 'What difficult situation are you facing that''s hard to see as "working together for good"? How does God''s love provide the foundation for this promise?'
    WHEN 'Psalm 139:13-16' THEN 'How does knowing God "knit you together" in your mother''s womb impact how you see your unique design and purpose?'
    
    -- Love & Relationships
    WHEN '1 Corinthians 13:4-7' THEN 'Which aspect of love (patient, kind, not envious, etc.) do you most need to grow in? How can you practice this kind of love today?'
    WHEN 'John 3:16' THEN 'How does the depth of God''s love demonstrated in giving His Son affect your understanding of your own worth and His love for you?'
    WHEN '1 John 4:19' THEN 'How has experiencing God''s love first changed your ability to love others? Who in your life needs to experience God''s love through you?'
    WHEN 'Romans 8:38-39' THEN 'What circumstances make you question God''s love? How does this list of things that cannot separate you from Christ''s love bring assurance?'
    
    -- Wisdom
    WHEN 'Proverbs 1:7' THEN 'What does it mean to "fear the Lord" in practical terms? How does this reverence for God lead to true wisdom in daily decisions?'
    WHEN 'James 1:5' THEN 'What specific area of your life needs God''s wisdom right now? How can you ask God for wisdom "without doubting"?'
    WHEN 'Proverbs 27:17' THEN 'Who in your life "sharpens" you spiritually? How can you be an "iron" that sharpens someone else today?'
    WHEN 'Ecclesiastes 3:1' THEN 'What "season" are you in right now? How can you embrace this time instead of wishing you were in a different season?'
    
    -- Service
    WHEN '1 Peter 5:2-3' THEN 'How can you serve others with eagerness rather than compulsion? What does it look like to lead by example rather than lording over others?'
    WHEN 'Philippians 2:3-4' THEN 'In what relationships do you struggle with selfish ambition? How can you look to others'' interests alongside your own?'
    WHEN 'Matthew 20:26-28' THEN 'Where do you seek to be served rather than to serve? How can you follow Jesus'' example of serving others today?'
    
    -- Prayer & Provision
    WHEN 'Matthew 6:9-13' THEN 'Which part of the Lord''s Prayer do you struggle with most? How can you make this prayer more personal and meaningful in your daily life?'
    WHEN '1 John 5:14-15' THEN 'What are you praying for that aligns with God''s will? How does confidence in prayer change when you know you''re asking according to His will?'
    WHEN 'Philippians 4:19' THEN 'What needs are you worried about God providing? How has God met your needs in the past in unexpected ways?'
    
    -- Suffering & Perseverance
    WHEN 'Job 1:20-22' THEN 'How do you typically respond when faced with loss or disappointment? What can you learn from Job''s response of worship in suffering?'
    WHEN 'Job 13:15' THEN 'What would it look like to trust God even when you don''t understand His ways? How can you maintain hope when circumstances seem hopeless?'
    WHEN 'Romans 5:3-5' THEN 'What suffering in your life has developed perseverance, character, or hope? How does viewing suffering this way change your perspective?'
    
    -- Scripture & Guidance
    WHEN '2 Timothy 3:16-17' THEN 'How has Scripture trained you in righteousness or corrected you recently? What area of your life needs God''s Word to equip you?'
    WHEN 'Joshua 1:9' THEN 'What situation requires courage from you today? How does knowing God is always with you strengthen you to be bold?'
    WHEN 'Psalm 119:105' THEN 'What decision or situation do you need God''s Word to illuminate? How can you practically let Scripture guide your steps?'
    WHEN 'Isaiah 40:31' THEN 'Where do you feel weary and need renewed strength? How can you "wait on the Lord" in practical ways today?'
    
    -- Transformation
    WHEN 'Galatians 5:22-23' THEN 'Which fruit of the Spirit do you most need to cultivate? How can you allow God''s Spirit to develop this quality in you?'
    WHEN 'Matthew 5:3-12' THEN 'Which beatitude speaks most to your current life situation? How does Jesus'' teaching challenge your understanding of blessing?'
    
    -- Additional common verses that may appear
    WHEN 'Psalm 23:4' THEN 'What "valley of the shadow of death" are you walking through? How have you experienced God''s presence and comfort in dark times?'
    WHEN '2 Corinthians 12:9' THEN 'In what area of weakness do you need to experience God''s strength? How can you boast in your weaknesses to showcase His power?'
    WHEN 'Colossians 3:23' THEN 'What work or task can you do "as unto the Lord" today? How does working for God''s glory change your motivation and attitude?'
    WHEN '1 Peter 2:9' THEN 'How does being called a "chosen people" and "royal priesthood" impact your identity? What darkness do you need to declare God''s light into?'
    WHEN 'Revelation 3:20' THEN 'What doors of your heart have you kept closed to Jesus? How is He knocking and waiting for you to invite Him in?'
    WHEN 'Matthew 11:28-30' THEN 'What burdens are you carrying that you need to give to Jesus? How can you find rest in Him today?'
    WHEN 'Deuteronomy 31:8' THEN 'What situation makes you feel alone or afraid? How can you hold onto the promise that God goes before you and will never leave you?'
    WHEN '1 John 1:9' THEN 'What sins do you need to confess to experience God''s forgiveness and cleansing? How does His faithfulness to forgive bring you peace?'
    WHEN 'Romans 12:2' THEN 'How is your mind being transformed by God''s truth? What patterns of thinking need to be renewed to align with His will?'
    WHEN 'Philippians 1:6' THEN 'What good work has God started in your life? How can you trust Him to complete what He''s begun, even when progress feels slow?'
    
    ELSE reflection_question  -- Keep existing question if no match
END
WHERE plan_id = (SELECT id FROM reading_plans WHERE name = 'Chronological Bible Order')
AND (reflection_question = 'How do today''s passages fit into God''s overall plan? What do you learn about His character?' 
     OR reflection_question IS NULL 
     OR reflection_question = '');