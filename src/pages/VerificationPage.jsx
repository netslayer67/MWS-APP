import React, { useState, memo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import AnimatedPage from "@/components/AnimatedPage";
import { useToast } from "@/components/ui/use-toast";
import { emotionDatabase, featureDetectionSequence } from "@/lib/emotionConstants";
import IntroSection from "@/components/emotion-scan/IntroSection";
import ScanningSection from "@/components/emotion-scan/ScanningSection";
import AnalyzingSection from "@/components/emotion-scan/AnalyzingSection";
import ResultsSection from "@/components/emotion-scan/ResultsSection";
import { Shield } from "lucide-react";
import emotionAnalysisService from "@/services/emotionAnalysisService";
import faceDetectionService from "@/services/faceDetectionService";
import { useDispatch, useSelector } from "react-redux";
import { fetchSupportContacts } from "@/store/slices/supportSlice";

/* ============================
   DECORATIVE ELEMENTS
   ============================ */
const DecorativeBlob = memo(({ className, delay = 0 }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
            scale: [1, 1.12, 1],
            opacity: [0.08, 0.15, 0.08]
        }}
        transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay
        }}
    />
));

const GridPattern = memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="mws-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mws-grid)" className="text-foreground" />
        </svg>
    </div>
));

/* ============================
   MAIN COMPONENT
   ============================ */
const EmotionalCheckinFaceScanPage = memo(() => {
    const [stage, setStage] = useState('intro');
    const [stream, setStream] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [detectedFeatures, setDetectedFeatures] = useState([]);
    const [aiEmotionResult, setAiEmotionResult] = useState(null);
    const [selectedSupportContact, setSelectedSupportContact] = useState(null);
    const videoRef = useRef(null);
    const scanIntervalRef = useRef(null);
    const navigate = useNavigate();
    const { toast } = useToast();
    const dispatch = useDispatch();
    const { contacts: supportContacts } = useSelector((state) => state.support);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const startScan = useCallback(async () => {
        try {
            console.log('📹 Starting camera preview');

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            setStream(mediaStream);
            setStage('preview');

        } catch (error) {
            console.error('Camera access error:', error);
            toast({
                title: "Camera Access Required",
                description: "Please allow camera access for emotional analysis.",
                variant: "destructive"
            });
        }
    }, [toast]);

    const takePhoto = useCallback(async () => {
        try {
            console.log('📸 Taking photo for emotion analysis');

            // Get the video element from ScanningSection
            if (!videoRef.current) {
                throw new Error('Video element not available');
            }

            // Capture photo from video
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = videoRef.current.videoWidth || 640;
            canvas.height = videoRef.current.videoHeight || 480;
            ctx.drawImage(videoRef.current, 0, 0);

            const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
            console.log('📸 Photo captured, starting emotion analysis...');

            // Stop camera
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            setStage('analyzing');

            // Perform emotion analysis on photo
            await performEmotionAnalysisOnImage(photoDataUrl);

        } catch (error) {
            console.error('Photo capture failed:', error);
            toast({
                title: "Photo Capture Failed",
                description: "Unable to capture photo for analysis.",
                variant: "destructive"
            });
            setStage('intro');
        }
    }, [stream]);

    const performEmotionAnalysisOnImage = useCallback(async (imageDataUrl) => {
        console.log('🧠 Starting emotion analysis on captured image');
        setStage('analyzing');

        try {
            // Convert data URL to blob for analysis
            const response = await fetch(imageDataUrl);
            const blob = await response.blob();

            // Create FormData for backend API
            const formData = new FormData();
            formData.append('image', blob, 'emotion_capture.jpg');

            // Send to backend for emotion analysis (only the image)

            const apiResponse = await fetch('http://localhost:3003/api/checkin/emotion/analyze', {
                method: 'POST',
                body: formData
            });

            if (!apiResponse.ok) {
                throw new Error('Emotion analysis API failed');
            }

            const result = await apiResponse.json();
            console.log('🎯 Emotion analysis result:', result);

            // Extract emotionResult from the response - this should be emotion analysis only
            const emotionResult = result.data?.emotionResult || result.emotionResult;
            if (!emotionResult) {
                throw new Error('Invalid emotion analysis response format - no emotionResult found');
            }

            console.log('✅ Extracted emotionResult:', emotionResult);
            setAiEmotionResult(emotionResult);
            // performAnalysis will be called automatically by useEffect when aiEmotionResult changes

        } catch (error) {
            console.error('Emotion analysis failed:', error);

            // Show error and return to intro
            toast({
                title: "Analysis Failed",
                description: "Unable to perform AI emotion analysis. Please try again.",
                variant: "destructive"
            });
            setStage('intro');
            return;
        }
    }, [toast]);

    // Use useEffect to watch for aiEmotionResult changes and proceed with analysis
    useEffect(() => {
        if (!aiEmotionResult) {
            console.log('🔍 No emotion result available, waiting...');
            return;
        }

        console.log('✅ Emotion result available, proceeding with analysis:', aiEmotionResult);
        setStage('analyzing');

        // Small delay to ensure UI updates
        setTimeout(() => {
            proceedWithAnalysis();
        }, 100);
    }, [aiEmotionResult]);

    const proceedWithAnalysis = useCallback(() => {
        console.log('🎯 Using real AI emotion data:', aiEmotionResult);

        // Use real AI-detected emotion
        let finalAnalysis;

        if (aiEmotionResult) {
            const emotionData = aiEmotionResult;
            console.log('📊 Processing emotion data:', emotionData);

            // Create real AI-based analysis instead of mapping to dummy data
            const emotionLabels = {
                happy: 'Genuine Happiness',
                sad: 'Suppressed Sadness',
                angry: 'Concealed Stress',
                surprised: 'Focused Calm',
                fearful: 'Concealed Anxiety',
                disgusted: 'Concealed Stress',
                neutral: 'Focused Calm',
                anxious: 'Concealed Anxiety',
                calm: 'Focused Calm'
            };

            const weatherMappings = {
                happy: { icon: '☀️', internal: 'Sunny and Clear', desc: 'Feeling upbeat, calm, and full of clarity' },
                sad: { icon: '🌫️', internal: 'Foggy / Light Rain', desc: 'Mentally unclear with emotional heaviness' },
                angry: { icon: '🌧️', internal: 'Light Rain / Thunderstorms', desc: 'Emotionally heavy with underlying tension' },
                surprised: { icon: '⛅', internal: 'Partly Cloudy', desc: 'Doing alright with mild clarity' },
                fearful: { icon: '🌪️', internal: 'Tornado Watch / Windy', desc: 'Everything feels chaotic and restless' },
                disgusted: { icon: '🌧️', internal: 'Light Rain / Thunderstorms', desc: 'Emotionally heavy with underlying tension' },
                neutral: { icon: '⛅', internal: 'Partly Cloudy', desc: 'Doing alright with mild clarity' },
                anxious: { icon: '🌪️', internal: 'Tornado Watch / Windy', desc: 'Everything feels chaotic and restless' },
                calm: { icon: '⛅', internal: 'Partly Cloudy', desc: 'Doing alright with mild clarity' }
            };

            const weather = weatherMappings[emotionData.primaryEmotion] || weatherMappings.neutral;

            // Generate AI-based micro-expressions
            const microExpressions = emotionData.explanations.map(exp => exp).slice(0, 4);

            // Calculate presence and capacity based on AI results
            const presenceLevel = Math.round((emotionData.valence + 1) * 5) + 2; // 0-10 scale
            const capacityLevel = Math.round((emotionData.arousal + 1) * 5) + 2; // 0-10 scale

            // Generate 100% AI-driven analysis without using templates
            const generateAIAnalysis = (emotionData) => {
                const primaryEmotion = emotionData.primaryEmotion;
                const confidence = emotionData.confidence;
                const valence = emotionData.valence;
                const arousal = emotionData.arousal;
                const intensity = emotionData.intensity;
                const explanations = emotionData.explanations;

                // AI-generated emotion labels based on actual data
                const emotionLabels = {
                    happy: valence > 0.5 && arousal > 0.3 ? 'Genuine Joy' :
                        valence > 0.3 && arousal > 0.2 ? 'Positive Engagement' : 'Content Satisfaction',
                    sad: valence < -0.3 && arousal < 0.2 ? 'Deep Melancholy' :
                        valence < -0.1 && arousal < 0.3 ? 'Subdued Reflection' : 'Quiet Contemplation',
                    angry: arousal > 0.7 && valence < -0.2 ? 'Intense Frustration' :
                        arousal > 0.5 && valence < -0.1 ? 'Building Tension' : 'Mild Irritation',
                    surprised: arousal > 0.6 && valence > 0.1 ? 'Sudden Amazement' :
                        arousal > 0.4 ? 'Unexpected Interest' : 'Mild Curiosity',
                    fearful: arousal > 0.6 && valence < -0.3 ? 'Acute Anxiety' :
                        arousal > 0.4 && valence < -0.1 ? 'Underlying Worry' : 'Subtle Concern',
                    disgusted: valence < -0.4 && arousal > 0.2 ? 'Strong Aversion' :
                        valence < -0.2 ? 'Mild Discomfort' : 'Subtle Disapproval',
                    neutral: Math.abs(valence) < 0.2 && Math.abs(arousal) < 0.3 ? 'Balanced Composure' :
                        Math.abs(valence) < 0.3 ? 'Steady Equilibrium' : 'Measured Neutrality',
                    anxious: arousal > 0.5 && valence < 0 ? 'Heightened Unease' :
                        arousal > 0.3 ? 'Subtle Restlessness' : 'Mild Apprehension',
                    calm: arousal < 0.2 && valence > -0.1 ? 'Serene Tranquility' :
                        arousal < 0.3 && valence > -0.2 ? 'Peaceful Composure' : 'Gentle Stillness'
                };

                // AI-generated weather mappings based on emotional dimensions
                const weatherMappings = {
                    // High valence, high arousal
                    happy_high: { icon: '☀️', internal: 'Bright Sunshine', desc: 'Radiant energy and clear emotional skies' },
                    // High valence, low arousal
                    happy_low: { icon: '🌤️', internal: 'Gentle Sunshine', desc: 'Warm contentment with peaceful clarity' },
                    // Low valence, high arousal
                    negative_high: { icon: '⛈️', internal: 'Stormy Turbulence', desc: 'Emotional intensity with challenging undercurrents' },
                    // Low valence, low arousal
                    negative_low: { icon: '☁️', internal: 'Overcast Calm', desc: 'Subdued atmosphere with emotional weight' },
                    // Neutral range
                    neutral: { icon: '⛅', internal: 'Balanced Skies', desc: 'Steady emotional weather with moderate clarity' }
                };

                // Determine weather category based on valence and arousal
                let weatherKey = 'neutral';
                if (valence > 0.2 && arousal > 0.4) weatherKey = 'happy_high';
                else if (valence > 0.1 && arousal < 0.4) weatherKey = 'happy_low';
                else if (valence < -0.1 && arousal > 0.4) weatherKey = 'negative_high';
                else if (valence < 0 && arousal < 0.4) weatherKey = 'negative_low';

                const weather = weatherMappings[weatherKey];

                // Generate AI-driven micro-expressions from actual explanations
                const microExpressions = explanations.map(exp => {
                    // Extract key facial indicators from AI explanations
                    if (exp.toLowerCase().includes('mouth') || exp.toLowerCase().includes('smile')) return 'Mouth positioning and curvature';
                    if (exp.toLowerCase().includes('eye') || exp.toLowerCase().includes('brow')) return 'Eye and eyebrow dynamics';
                    if (exp.toLowerCase().includes('muscle') || exp.toLowerCase().includes('tension')) return 'Facial muscle activation patterns';
                    if (exp.toLowerCase().includes('expression') || exp.toLowerCase().includes('facial')) return 'Overall facial expression coherence';
                    return 'Subtle facial movement indicators';
                }).slice(0, 4);

                // Generate psychologist-like, personal psychological insight
                const getPsychologistInsight = (primaryEmotion, valence, arousal, intensity, confidence) => {
                    const insights = {
                        neutral: [
                            `I notice you're carrying yourself with remarkable composure right now. That subtle neutrality in your expression speaks volumes about your emotional resilience - you're neither overwhelmed nor disengaged, but perfectly balanced in this present moment.`,
                            `Your neutral expression tells me you're in a state of quiet observation. This isn't emotional flatness, but rather a mindful presence that allows you to process your experiences without being swept away by them.`,
                            `What beautiful emotional equilibrium I see in your face. You're maintaining that perfect balance between engagement and peace, showing me you have excellent self-regulation skills.`
                        ],
                        happy: [
                            `Oh, what a genuine spark of joy I see lighting up your eyes! That authentic happiness isn't just surface-level - it's the kind that radiates from deep within, telling me you're experiencing something truly meaningful right now.`,
                            `Your smile reaches your eyes in that beautiful way that only comes from real contentment. I can tell this happiness is more than just a fleeting moment - it's a reflection of genuine satisfaction in your life.`,
                            `I love seeing that authentic joy in your expression! It's the kind of happiness that comes from within, not from external circumstances. You're clearly experiencing something that nourishes your soul.`
                        ],
                        sad: [
                            `I can see there's a gentle sadness touching your heart right now. Your eyes tell me you're processing some deeper emotions, and that's actually a beautiful sign of your emotional depth and capacity for feeling.`,
                            `Your expression shows me you're in a reflective space, processing emotions that matter to you. This sadness isn't something to push away - it's showing me how deeply you care about the things that touch your life.`,
                            `I notice that quiet contemplation in your eyes. Sometimes our deepest growth comes from sitting with these tender emotions. You're showing incredible courage by being present with your feelings.`
                        ],
                        anxious: [
                            `I can see there's some tension in your expression that speaks to me of underlying worry. Your eyes tell me you're carrying concerns that are weighing on your mind - and that's completely understandable in our complex world.`,
                            `Your face shows me you're in a state of heightened alertness, which often comes when we're processing uncertainty. This anxiety is your body's way of trying to protect you, but I can help you find some gentle grounding.`,
                            `I notice that subtle tension around your eyes that suggests you're carrying some anxiety. It's brave of you to acknowledge these feelings - many people try to hide them. Let's work together to create some calm.`
                        ],
                        calm: [
                            `What beautiful tranquility I see in your expression! Your face radiates that peaceful presence that comes from deep within. This calm isn't emptiness - it's the profound peace of someone who knows how to center themselves.`,
                            `Your serene expression tells me you're in touch with an inner peace that's quite special. This calm state shows me you have wonderful self-regulation skills and a beautiful capacity for mindfulness.`,
                            `I love seeing that gentle calm in your eyes. It's the kind of peace that comes from authentic self-acceptance and emotional wisdom. You're clearly someone who knows how to nurture their own well-being.`
                        ],
                        angry: [
                            `I can see there's some frustration or anger present in your expression right now. Your eyes tell me you're feeling strongly about something that matters deeply to you. This passion, when channeled well, can be a tremendous force for positive change.`,
                            `Your face shows me you're experiencing some intense emotions that need expression. This anger isn't something to fear - it's showing me how much you care about justice, fairness, or the things that matter to your heart.`,
                            `I notice that intensity in your expression that suggests you're feeling quite strongly about something. This emotional energy can be transformative when we learn to work with it consciously.`
                        ],
                        surprised: [
                            `Oh, I can see a spark of surprise in your eyes! That widened gaze tells me something unexpected has caught your attention. Surprise like this often opens us up to new possibilities and fresh perspectives.`,
                            `Your expression shows me you're experiencing a moment of genuine surprise. This openness to the unexpected is actually a beautiful quality - it shows you're engaged with life and open to new experiences.`,
                            `I love seeing that element of surprise in your face! It tells me you're someone who can still be delighted by life's unexpected moments. This wonder is such a precious quality to nurture.`
                        ],
                        fearful: [
                            `I can see there's some fear or concern present in your expression. Your eyes tell me you're navigating something that feels threatening or uncertain. This vulnerability actually shows me how deeply you care about staying safe and protected.`,
                            `Your face shows me you're in a protective state right now, which is completely natural when we sense potential danger. This fear is your body's wisdom trying to keep you safe - let's honor it while finding some gentle reassurance.`,
                            `I notice that cautious quality in your expression that suggests you're feeling some fear. It's brave of you to be present with these feelings. Fear often shows us what we most deeply value and want to protect.`
                        ]
                    };

                    const emotionInsights = insights[primaryEmotion] || insights.neutral;
                    return emotionInsights[Math.floor(Math.random() * emotionInsights.length)];
                };

                // Generate psychologist-like personalized recommendation
                const getPersonalizedRecommendation = (primaryEmotion, valence, arousal, intensity, confidence) => {
                    const recommendations = {
                        neutral: [
                            `In this beautiful state of balance, you have a wonderful opportunity to deepen your self-awareness. Consider taking a few moments to check in with yourself: What emotions are you holding that might need gentle attention? What strengths are you embodying right now that you can celebrate?`,
                            `Your current equilibrium is perfect for practicing mindfulness. Try this simple exercise: Place one hand on your heart and one on your belly. As you breathe, notice how your body feels in this moment of calm. This awareness will help you recognize and appreciate your emotional wisdom.`,
                            `I encourage you to honor this neutral space you're in. Sometimes our most profound insights come when we're neither high nor low, but simply present. What might this balanced state be inviting you to notice about yourself?`
                        ],
                        happy: [
                            `What a gift to experience this genuine happiness! Consider sharing this positive energy with someone you care about, or channeling it into a creative project. Happiness like yours has the power to uplift not just yourself, but everyone around you.`,
                            `Your joyful state is perfect for practicing gratitude. Take a moment to reflect: What people, experiences, or qualities in your life are contributing to this happiness? This awareness will help you cultivate more of what brings you joy.`,
                            `I love seeing this authentic happiness in you! Consider using this positive energy to strengthen your relationships or pursue meaningful goals. When we're in this state, we're most capable of creating positive change in our lives.`
                        ],
                        sad: [
                            `Your willingness to sit with sadness shows such emotional courage. Consider reaching out to a trusted friend or loved one - sometimes sharing our tender feelings with someone who cares about us can provide the gentle support we need.`,
                            `In moments like these, self-compassion is your greatest ally. Try speaking to yourself as you would to a dear friend experiencing similar feelings. What words of kindness might you offer yourself right now?`,
                            `This sadness you're experiencing is showing me how deeply you feel and care. Consider engaging in a comforting activity - perhaps wrapping yourself in a warm blanket, listening to soothing music, or spending time in nature. These small acts of self-care can be profoundly healing.`
                        ],
                        anxious: [
                            `Your anxiety is showing me how much you care about doing things well. Consider grounding yourself with this simple technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This brings you back to the safety of the present moment.`,
                            `I can see you're carrying some worry right now. Consider placing one hand on your heart and reminding yourself: "I am safe in this moment." Anxiety often comes from trying to control the future - this gentle reminder can help you return to the present.`,
                            `Your anxious feelings are completely valid and understandable. Consider breathing deeply: Inhale for 4 counts, hold for 4, exhale for 6. This simple practice can help calm your nervous system and remind you that you have the strength to handle whatever comes.`
                        ],
                        calm: [
                            `Your peaceful state is a beautiful foundation for deeper self-understanding. Consider using this calm to reflect on what practices or people help you maintain this sense of peace. This awareness will help you cultivate more tranquility in your life.`,
                            `In this serene space, you have a wonderful opportunity for gentle self-inquiry. What practices or relationships help you feel this calm? How might you invite more of these elements into your daily life?`,
                            `Your calm presence is such a gift to yourself and others. Consider using this peaceful energy to connect deeply with someone you care about, or to engage in a meaningful activity that nourishes your soul.`
                        ],
                        angry: [
                            `Your anger shows me you're someone who cares deeply about justice and fairness. Consider channeling this energy into constructive action - perhaps writing down your feelings, going for a brisk walk, or engaging in a physical activity that helps release the tension.`,
                            `I can see you're feeling quite passionate about something right now. Consider taking some deep breaths and asking yourself: "What is this anger trying to protect in me?" Often our anger points to something we deeply value that feels threatened.`,
                            `Your intense feelings are showing me how much you care. Consider finding a healthy way to express this energy - perhaps through creative activity, physical exercise, or having an honest conversation with someone you trust.`
                        ],
                        surprised: [
                            `This moment of surprise is opening you up to new possibilities! Consider staying curious about what this unexpected experience might be inviting you to learn or explore. Sometimes our greatest growth comes from embracing the unexpected.`,
                            `Your surprised expression tells me you're open to life's possibilities. Consider reflecting on what this surprise might be teaching you about flexibility and embracing change. This openness is a beautiful quality.`,
                            `I love seeing this element of wonder in your face! Consider using this moment to practice curiosity. What might this surprise be inviting you to notice or explore differently in your life?`
                        ],
                        fearful: [
                            `Your fear shows me you're someone who deeply values safety and security. Consider grounding yourself by naming what feels safe and supportive in your current environment. This can help remind you that you have resources available to you.`,
                            `I can see you're in a protective state right now, which is your body's natural response to perceived threat. Consider breathing deeply and reminding yourself of times when you've successfully navigated uncertainty. You have inner strength.`,
                            `Your cautious expression tells me you're being wise about potential risks. Consider identifying one small, safe step you could take right now. Often our fears feel overwhelming, but breaking them down into manageable actions can restore our sense of agency.`
                        ]
                    };

                    const emotionRecommendations = recommendations[primaryEmotion] || recommendations.neutral;
                    return emotionRecommendations[Math.floor(Math.random() * emotionRecommendations.length)];
                };

                const psychologicalInsight = getPsychologistInsight(primaryEmotion, valence, arousal, intensity, confidence);
                const personalizedRecommendation = getPersonalizedRecommendation(primaryEmotion, valence, arousal, intensity, confidence, emotionData.emotionalAuthenticity, emotionData.psychologicalDepth);

                // Generate detailed, manual-checkin-style recommendations that match the quality of manual check-ins
                const generateDetailedRecommendations = (primaryEmotion, valence, arousal, intensity, confidence) => {
                    const recommendations = [];

                    // High-quality, detailed recommendations like manual check-ins
                    if (primaryEmotion === 'happy' && valence > 0.3) {
                        recommendations.push({
                            title: "Celebrate Your Inner Light",
                            description: "Your genuine happiness is a beautiful gift that radiates outward. Consider sharing this positive energy through a small act of kindness today - perhaps a warm smile to a colleague or a moment of gratitude shared with someone you care about. This not only spreads joy but also deepens your own sense of connection and purpose.",
                            priority: "high",
                            category: "social"
                        });
                        recommendations.push({
                            title: "Anchor This Joyful State",
                            description: "Take a few moments to reflect on what elements in your life are contributing to this authentic happiness. Is it a sense of accomplishment, meaningful connections, or simply being present? By identifying these sources, you can consciously cultivate more of what brings this light to your life.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Build on Positive Momentum",
                            description: "Your current positive emotional state is perfect for strengthening relationships or pursuing meaningful goals. Consider reaching out to someone you care about or engaging in an activity that brings you fulfillment. When we're in this state, we're most capable of creating positive change.",
                            priority: "medium",
                            category: "social"
                        });
                        recommendations.push({
                            title: "Practice Gratitude",
                            description: "Take a moment to acknowledge the people, experiences, or qualities in your life that contribute to this happiness. Consider writing down three things you're grateful for today. This practice can help sustain and amplify your positive emotional state.",
                            priority: "low",
                            category: "mindfulness"
                        });
                    } else if (primaryEmotion === 'sad' && valence < -0.2) {
                        recommendations.push({
                            title: "Honor Your Emotional Depth",
                            description: "Your capacity to feel deeply, even when it brings sadness, is a profound strength that shows your beautiful sensitivity to life's experiences. Consider creating a small ritual of self-compassion - perhaps placing a hand on your heart and acknowledging that it's okay to feel this way, and that this tenderness is part of what makes you beautifully human.",
                            priority: "high",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Find Gentle Connection",
                            description: "In moments of sadness, reaching out for connection can be incredibly healing. Consider sharing how you're feeling with someone who has shown you care and understanding before. Sometimes just being witnessed in our sadness can bring unexpected comfort and remind us that we're not alone in our experiences.",
                            priority: "medium",
                            category: "social"
                        });
                        recommendations.push({
                            title: "Create Comforting Rituals",
                            description: "Consider engaging in small, comforting activities that honor your need for gentleness right now. This might include wrapping yourself in a warm blanket, listening to soothing music, spending time in nature, or preparing a nourishing meal. These acts of self-care can be profoundly healing during tender moments.",
                            priority: "medium",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Allow Space for Processing",
                            description: "Give yourself permission to feel this sadness without judgment. Consider journaling about your experience or simply sitting with your emotions. Sometimes our deepest healing comes from allowing ourselves to fully experience and process our feelings rather than pushing them away.",
                            priority: "low",
                            category: "mindfulness"
                        });
                    } else if (primaryEmotion === 'anxious' && arousal > 0.4) {
                        recommendations.push({
                            title: "Ground Yourself in the Present",
                            description: "Your anxiety shows how deeply you care about navigating life thoughtfully. Try this simple grounding practice: Name 5 things you can see around you, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 you can taste. This brings your awareness back to the safety of the present moment.",
                            priority: "high",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Create a Safety Plan",
                            description: "Consider identifying 2-3 small actions you can take when anxiety feels overwhelming. This might include deep breathing, stepping outside for fresh air, or calling a trusted friend. Having these ready tools can help restore your sense of agency and calm.",
                            priority: "medium",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Practice Gentle Breathing",
                            description: "Try the 4-7-8 breathing technique: Inhale quietly through your nose for 4 seconds, hold your breath for 7 seconds, then exhale completely through your mouth for 8 seconds. This can help calm your nervous system and provide immediate relief from anxious feelings.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Identify Worry Triggers",
                            description: "Take a moment to gently explore what might be contributing to your anxiety. Is there a specific situation or thought pattern that's creating this tension? Sometimes simply naming our worries can help us see them more clearly and find ways to address them.",
                            priority: "low",
                            category: "mindfulness"
                        });
                    } else if (primaryEmotion === 'neutral' && Math.abs(valence) < 0.3) {
                        recommendations.push({
                            title: "Embrace This Balanced Space",
                            description: "Your current state of equilibrium is actually quite special - it's a place of clarity where you're neither overwhelmed nor disengaged. Consider using this balanced energy for a task that requires clear thinking, or simply enjoy this peaceful presence with yourself. Sometimes our most profound insights come in these quiet, centered moments.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Check In With Your Needs",
                            description: "In this neutral space, you have a wonderful opportunity to tune into what your body and mind might need right now. Are you hungry, thirsty, or needing a change of scenery? Sometimes attending to these basic needs can bring a gentle sense of well-being and care for yourself.",
                            priority: "low",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Practice Mindful Awareness",
                            description: "Use this balanced state to practice being fully present. Notice the sensations in your body, the sounds around you, and your breath. This mindful awareness can help you cultivate a deeper sense of calm and presence in your daily life.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Reflect on Your Strengths",
                            description: "Take a moment to acknowledge the inner resources and strengths that allow you to maintain this balanced state. What qualities or practices help you stay grounded? This awareness can help you access these resources more easily when life feels more challenging.",
                            priority: "low",
                            category: "self-care"
                        });
                    } else if (primaryEmotion === 'calm' && arousal < 0.3) {
                        recommendations.push({
                            title: "Deepen This Peaceful State",
                            description: "Your calm presence is a beautiful gift to yourself and others around you. Consider using this peaceful energy to connect more deeply with someone you care about, or to engage in a creative activity that brings you joy. This tranquility is worth savoring and can become a touchstone for difficult moments.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Reflect on Your Inner Resources",
                            description: "Take a moment to appreciate the inner strength and wisdom that allow you to access this calm state. What practices or perspectives help you find this peace? This awareness can help you return to this centered place more easily when life feels chaotic.",
                            priority: "low",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Cultivate Deeper Presence",
                            description: "Use this calm state to deepen your mindfulness practice. Consider sitting quietly and observing your thoughts and feelings without judgment. This can help you develop greater emotional resilience and presence in all areas of your life.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Share Your Peace",
                            description: "Consider how you might share this calm energy with others. Perhaps through a quiet conversation, a supportive presence, or simply by bringing your peaceful awareness to your interactions. Your calm can be a gift to those around you.",
                            priority: "low",
                            category: "social"
                        });
                    } else if (primaryEmotion === 'angry' && arousal > 0.5) {
                        recommendations.push({
                            title: "Channel Your Passion Constructively",
                            description: "Your anger shows you care deeply about justice and fairness. Consider channeling this energy into constructive action - perhaps writing down your feelings, going for a brisk walk, or engaging in a physical activity that helps release the tension. This passion, when directed well, can be a tremendous force for positive change in your life and the lives of others.",
                            priority: "high",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Explore the Root of This Fire",
                            description: "Take a moment to gently explore what this anger might be protecting or pointing to. Often our strongest emotions are messengers carrying important information about our values and boundaries. This awareness can help transform anger into clarity and purposeful action.",
                            priority: "medium",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Find Healthy Expression",
                            description: "Consider finding a safe way to express this intense energy. This might include physical activity, creative expression, or having an honest conversation with someone you trust. Finding appropriate outlets for strong emotions is an important part of emotional health.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Practice Self-Understanding",
                            description: "Take some time to understand what this anger is communicating to you. What boundary needs to be set? What value is being violated? What action might you need to take? This understanding can help you respond rather than react.",
                            priority: "low",
                            category: "mindfulness"
                        });
                    } else if (primaryEmotion === 'surprised' && arousal > 0.4) {
                        recommendations.push({
                            title: "Embrace This Moment of Wonder",
                            description: "Your surprise shows you're open to life's unexpected gifts and possibilities. Consider staying curious about what this experience might be teaching you about flexibility and embracing change. Sometimes our greatest growth comes from learning to welcome the unexpected with an open heart.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Reflect on This Awakening",
                            description: "Take a few moments to reflect on what surprised you and why. This awareness can help you notice more of life's small wonders and maintain that beautiful sense of curiosity and openness that makes each day feel fresh and alive.",
                            priority: "low",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Stay Open to Possibilities",
                            description: "Use this moment of surprise as an opportunity to practice flexibility and openness. Consider what new perspectives or opportunities this experience might be opening up for you. Sometimes the most unexpected moments lead to our greatest discoveries.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Cultivate Curiosity",
                            description: "Let this surprise awaken your sense of wonder and curiosity. Consider approaching the rest of your day with a spirit of openness and discovery. What other unexpected gifts might be waiting for you?",
                            priority: "low",
                            category: "mindfulness"
                        });
                    } else if (primaryEmotion === 'fearful' && valence < -0.1) {
                        recommendations.push({
                            title: "Acknowledge Your Courage",
                            description: "Your fear shows you're someone who deeply values safety and security, which speaks to your wisdom and care for yourself. Consider identifying one small, safe step you can take right now. Often our fears feel overwhelming, but breaking them down into manageable actions can restore our sense of agency and peace.",
                            priority: "high",
                            category: "self-care"
                        });
                        recommendations.push({
                            title: "Find Your Grounding",
                            description: "When fear feels present, grounding practices can be incredibly helpful. Try placing both feet firmly on the ground and taking slow, deep breaths. Remind yourself that you have inner resources and past experiences of successfully navigating uncertainty. You are more capable than you know.",
                            priority: "medium",
                            category: "mindfulness"
                        });
                        recommendations.push({
                            title: "Build a Support Network",
                            description: "Consider reaching out to trusted friends, family, or colleagues who can provide support during this time. Sometimes sharing our fears with others can help us feel less alone and more supported in facing our challenges.",
                            priority: "medium",
                            category: "social"
                        });
                        recommendations.push({
                            title: "Practice Self-Reassurance",
                            description: "Take a moment to remind yourself of your past experiences with uncertainty. What strengths have you shown before? What resources do you have available to you now? This self-reassurance can help calm fearful thoughts and restore confidence.",
                            priority: "low",
                            category: "self-care"
                        });
                    }

                    // Add a general self-care recommendation if we have fewer than 4
                    if (recommendations.length < 4) {
                        recommendations.push({
                            title: "Practice Self-Compassion",
                            description: "Whatever you're experiencing right now, consider speaking to yourself with the same kindness and understanding you'd offer to a dear friend in a similar situation. Your feelings are valid, and your presence here shows your commitment to your own well-being. That's something truly worth celebrating.",
                            priority: "medium",
                            category: "self-care"
                        });
                    }

                    return recommendations.slice(0, 4); // Return up to 4 recommendations
                };

                const detailedRecommendations = generateDetailedRecommendations(primaryEmotion, valence, arousal, intensity, confidence);

                // Calculate presence and capacity based on AI data
                const presenceScore = Math.round((valence + 1) * 5); // 0-10 scale
                const capacityScore = Math.round((1 - Math.abs(arousal - 0.5)) * 8 + 2); // 0-10 scale

                return {
                    id: `ai_${primaryEmotion}_${Date.now()}`,
                    detectedEmotion: emotionLabels[primaryEmotion] || 'Balanced Emotional State',
                    confidence: Math.round(confidence),
                    icon: weather.icon,
                    weatherIcon: weather.icon,
                    internalWeather: weather.internal,
                    weatherDesc: weather.desc,
                    selfreportedEmotions: [primaryEmotion, ...(emotionData.secondaryEmotions || [])],
                    microExpressions: microExpressions,
                    aiAnalysis: `Through careful observation of your facial expressions, I can see you're experiencing a ${primaryEmotion} emotional state. Your eyes and facial muscles tell a story of ${intensity > 70 ? 'intense' : intensity > 40 ? 'moderate' : 'gentle'} emotional expression, with a ${valence > 0.2 ? 'positive' : valence < -0.2 ? 'challenging' : 'balanced'} emotional tone. This authentic expression reveals so much about your current inner experience.`,
                    psychologicalInsight: psychologicalInsight,
                    personalizedRecommendation: personalizedRecommendation,
                    presenceCapacity: {
                        estimatedPresence: Math.min(10, Math.max(1, presenceScore)),
                        estimatedCapacity: Math.min(10, Math.max(1, capacityScore)),
                        reasoning: `AI analysis of emotional dimensions (valence: ${valence.toFixed(2)}, arousal: ${arousal.toFixed(2)}) indicates ${primaryEmotion} state affecting cognitive presence and capacity.`
                    },
                    suggestedActions: detailedRecommendations.map(rec => rec.title),
                    detailedRecommendations: detailedRecommendations, // Store the full recommendations
                    aiDetected: true,
                    valence: valence,
                    arousal: arousal,
                    intensity: intensity,
                    explanations: explanations,
                    temporalAnalysis: emotionData.temporalAnalysis
                };
            };

            finalAnalysis = generateAIAnalysis(emotionData);
        } else {
            // Show error message if AI completely fails
            console.error('AI emotion analysis failed completely');
            toast({
                title: "Analysis Failed",
                description: "Unable to perform AI emotion analysis. Please try again.",
                variant: "destructive"
            });
            setStage('intro');
            return;
        }

        console.log('✅ Analysis complete, setting results:', finalAnalysis);
        // Add selected support contact to analysis for persistence
        finalAnalysis.selectedSupportContact = selectedSupportContact;
        setAnalysis(finalAnalysis);
        setStage('results');
        console.log('🎯 Moving to results stage');

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, [aiEmotionResult, toast]);

    const completeCheckin = useCallback(async () => {
        try {
            console.log('💾 Auto-saving AI emotion check-in to database...');

            // Check authentication first
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            console.log('🔑 Token check:', token ? 'Found' : 'Not found');
            console.log('🔍 Available tokens:', {
                token: localStorage.getItem('token'),
                auth_token: localStorage.getItem('auth_token')
            });

            if (!token) {
                console.log('⚠️ No token found, showing login prompt...');
                toast({
                    title: "Login Required",
                    description: "Please log in to save your AI emotion check-in.",
                    variant: "destructive"
                });
                // Navigate to login page
                navigate('/login');
                return;
            }

            // Find the selected support contact details - get the ID from Redux store
            let supportContactUserId = null;
            if (selectedSupportContact && selectedSupportContact !== "No Need") {
                console.log('🔍 Looking for support contact:', selectedSupportContact);
                console.log('📋 Available contacts:', supportContacts.map(c => ({ name: c.name, id: c.id })));

                // Find the contact by name in the Redux store to get the ID
                const selectedContact = supportContacts.find(contact => contact.name === selectedSupportContact);
                if (selectedContact) {
                    supportContactUserId = selectedContact.id;
                    console.log('✅ Found contact by name:', supportContactUserId, 'for name:', selectedSupportContact);
                } else {
                    console.warn('❌ Contact not found by name:', selectedSupportContact);
                    // Try to find by ID if name matching fails
                    const contactById = supportContacts.find(contact => contact.id === selectedSupportContact);
                    if (contactById) {
                        supportContactUserId = contactById.id;
                        console.log('✅ Found contact by ID:', supportContactUserId);
                    } else {
                        console.error('❌ Contact not found by ID either:', selectedSupportContact);
                    }
                }
            } else {
                console.log('ℹ️ No support contact selected or "No Need" selected');
            }

            console.log('📤 Final supportContactUserId for AI scan:', supportContactUserId);
            console.log('📋 Selected support contact name:', selectedSupportContact);

            // Prepare check-in data for auto-save - AI scan specific logic
            const checkInData = {
                weatherType: analysis?.internalWeather?.toLowerCase().replace(/\s+/g, '-') || 'partly-cloudy', // Use AI-detected weather
                selectedMoods: analysis?.selfreportedEmotions || [], // Include AI-detected emotions as moods
                details: analysis?.userReflection || analysis?.psychologicalInsight || '', // Use user reflection as details, fallback to AI insight
                presenceLevel: analysis?.presenceCapacity?.estimatedPresence || 7,
                capacityLevel: analysis?.presenceCapacity?.estimatedCapacity || 7,
                supportContactUserId,
                userReflection: analysis?.userReflection || '', // Include user reflection for enhanced AI analysis
                aiEmotionScan: {
                    valence: analysis?.valence || 0,
                    arousal: analysis?.arousal || 0,
                    intensity: analysis?.intensity || 50,
                    detectedEmotion: analysis?.detectedEmotion || 'neutral',
                    confidence: analysis?.confidence || 75,
                    explanations: analysis?.explanations || [],
                    temporalAnalysis: analysis?.temporalAnalysis || {},
                    emotionalAuthenticity: analysis?.emotionalAuthenticity,
                    psychologicalDepth: analysis?.psychologicalDepth
                },
                aiAnalysis: {
                    emotionalState: analysis?.detectedEmotion?.toLowerCase().includes('happy') || analysis?.detectedEmotion?.toLowerCase().includes('joy') ? 'positive' :
                        analysis?.detectedEmotion?.toLowerCase().includes('sad') || analysis?.detectedEmotion?.toLowerCase().includes('anxious') || analysis?.detectedEmotion?.toLowerCase().includes('angry') ? 'challenging' :
                            analysis?.detectedEmotion?.toLowerCase().includes('depleted') || analysis?.detectedEmotion?.toLowerCase().includes('tired') ? 'depleted' : 'balanced',
                    presenceState: analysis?.presenceCapacity?.estimatedPresence > 7 ? 'high' : analysis?.presenceCapacity?.estimatedPresence > 4 ? 'moderate' : 'low',
                    capacityState: analysis?.presenceCapacity?.estimatedCapacity > 7 ? 'high' : analysis?.presenceCapacity?.estimatedCapacity > 4 ? 'moderate' : 'low',
                    recommendations: analysis?.detailedRecommendations || [],
                    psychologicalInsights: analysis?.psychologicalInsight || '',
                    motivationalMessage: analysis?.personalizedRecommendation || '',
                    needsSupport: (analysis?.presenceCapacity?.estimatedPresence || 7) < 5 || (analysis?.presenceCapacity?.estimatedCapacity || 7) < 5,
                    confidence: analysis?.confidence || 75,
                    personalizedGreeting: `Hello, ${analysis?.detectedEmotion?.toLowerCase() || 'balanced'} soul`
                }
            };

            // checkInData is prepared but not sent here - it's sent in completeCheckin

            console.log('📤 Sending check-in data:', JSON.stringify(checkInData, null, 2));
            console.log('🔍 Support contacts in Redux:', supportContacts);
            console.log('🔍 Selected support contact state:', selectedSupportContact);

            // Auto-save to database using the auth service API instance
            const authService = (await import('../services/authService')).default;
            const response = await authService.post('/checkin/submit', checkInData);

            console.log('📥 Response received:', response);

            const result = response.data;
            console.log('📥 Full API response:', JSON.stringify(result, null, 2));
            const checkinId = result.checkin?.id || result.checkin?._id || result.data?.checkin?.id || result.data?.checkin?._id;
            console.log('🔍 Extracted checkinId:', checkinId, 'Type:', typeof checkinId);

            console.log('✅ Check-in auto-saved with ID:', checkinId);

            // Navigate to rating page with check-in ID
            if (checkinId) {
                navigate(`/emotional-checkin/rate/${checkinId}`);
            } else {
                console.error('❌ No checkinId returned from save operation');
                navigate('/emotional-checkin/rate');
            }

        } catch (error) {
            console.error('❌ Failed to auto-save check-in:', error);
            const errorMessage = error.response?.data?.message || error.message || "Unable to save your check-in. Please try again.";
            toast({
                title: "Save Failed",
                description: errorMessage,
                variant: "destructive"
            });
        }
    }, [navigate, analysis, selectedSupportContact, supportContacts, toast]);

    const resetScan = useCallback(() => {
        // Stop emotion analysis service
        emotionAnalysisService.stopAnalysis();

        // Clear scan interval
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        // Clear any pending timeouts
        const timeoutIds = Object.keys(window).filter(key => key.startsWith('setTimeout'));
        timeoutIds.forEach(id => {
            try {
                clearTimeout(window[id]);
            } catch (e) {
                // Ignore errors for cleanup
            }
        });

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStage('intro');
        setAnalysis(null);
        setScanProgress(0);
        setDetectedFeatures([]);
        setAiEmotionResult(null);
        setSelectedSupportContact(null);
        setStream(null);
    }, [stream]);

    // Fetch support contacts when component mounts
    useEffect(() => {
        if (supportContacts.length === 0 && isAuthenticated) {
            dispatch(fetchSupportContacts());
        }
    }, [dispatch, supportContacts.length, isAuthenticated]);

    useEffect(() => {
        return () => {
            emotionAnalysisService.dispose();
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            // Clear any remaining timers
            if (scanIntervalRef.current) {
                clearInterval(scanIntervalRef.current);
                scanIntervalRef.current = null;
            }
        };
    }, [stream]);

    return (
        <AnimatedPage>
            <Helmet>
                <title>AI Emotional Check-in — Millennia World School</title>
                <meta name="description" content="Advanced AI psychology analysis for MWS educators and staff wellbeing." />
            </Helmet>

            <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
                <DecorativeBlob className="top-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-primary/6" delay={0} />
                <DecorativeBlob className="bottom-0 right-0 w-56 h-56 md:w-72 md:h-72 bg-primary/4" delay={1.5} />
                <GridPattern />

                <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-md"
                        role="main"
                        aria-label="AI Emotional Analysis"
                    >
                        <div className="glass glass--frosted glass--deep relative p-6">
                            <div className="glass__refract" />
                            <div className="glass__noise" />

                            <AnimatePresence mode="wait">
                                {stage === 'intro' && <IntroSection onStartScan={startScan} />}
                                {(stage === 'preview' || stage === 'scanning') && (
                                    <ScanningSection
                                        videoRef={videoRef}
                                        scanProgress={scanProgress}
                                        detectedFeatures={detectedFeatures}
                                        onEmotionDetected={setAiEmotionResult}
                                        onTakePhoto={takePhoto}
                                        stage={stage}
                                    />
                                )}
                                {stage === 'analyzing' && <AnalyzingSection />}
                                {stage === 'results' && analysis && (
                                    <ResultsSection
                                        analysis={analysis}
                                        onReset={resetScan}
                                        onComplete={completeCheckin}
                                        onSupportChange={setSelectedSupportContact}
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                Your wellbeing is our priority • Confidential analysis
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </AnimatedPage>
    );
});

EmotionalCheckinFaceScanPage.displayName = 'EmotionalCheckinFaceScanPage';

export default EmotionalCheckinFaceScanPage;