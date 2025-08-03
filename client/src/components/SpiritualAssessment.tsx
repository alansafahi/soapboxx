import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Heart, BookOpen, Brain, Users, Clock, Target, ArrowRight, ArrowLeft } from 'lucide-react';

export interface SpiritualAssessmentData {
  // 120 spiritual gifts assessment questions with 5-point scale responses
  responses: number[]; // Array of 120 responses (1-5 scale: 1=Strongly Disagree, 5=Strongly Agree)
  // Optional demographic and context fields
  timeAvailability?: string;
  currentChallenges?: string;
  spiritualHopes?: string;
}

interface SpiritualAssessmentProps {
  onComplete: (data: SpiritualAssessmentData) => void;
  onBack?: () => void;
  userRole?: string;
}

export default function SpiritualAssessment({ onComplete, onBack, userRole }: SpiritualAssessmentProps) {
  // Check if assessment is mandatory for Church Admin roles
  const isRoleMandatory = userRole === 'admin' || userRole === 'church_admin' || userRole === 'owner';
  
  // 120 spiritual gifts assessment questions
  const spiritualGiftsQuestions = [
    // Leadership (Questions 1-10)
    "I enjoy organizing people and resources to accomplish goals.",
    "Others naturally look to me for direction during group activities.",
    "I am comfortable making decisions that affect other people.",
    "I can see the big picture when others get caught up in details.",
    "People often ask me to take charge of projects or activities.",
    "I am willing to take responsibility when things go wrong.",
    "I enjoy motivating others to reach their potential.",
    "I can delegate tasks effectively to team members.",
    "I am comfortable with the authority that comes with leadership.",
    "I have a vision for how things could be improved in my community.",

    // Teaching (Questions 11-20)
    "I enjoy explaining biblical concepts to others.",
    "People tell me I make complex ideas easy to understand.",
    "I spend time studying to ensure I understand Scripture correctly.",
    "I enjoy preparing lessons or presentations.",
    "I get excited when I see others learn something new.",
    "I am comfortable speaking in front of groups.",
    "I enjoy answering questions about faith and the Bible.",
    "I like to research topics thoroughly before sharing them.",
    "I feel fulfilled when I help others grow in their understanding.",
    "I am patient with people who learn at different speeds.",

    // Mercy (Questions 21-30)
    "I am deeply moved by the suffering of others.",
    "I am drawn to help people who are hurting emotionally.",
    "I can sense when someone is sad even if they don't say anything.",
    "I prefer to help people one-on-one rather than in groups.",
    "I am a good listener when people need to talk.",
    "I often cry when I see others in pain.",
    "I am patient with people who are struggling.",
    "I feel called to comfort those who are grieving.",
    "I am gentle in my approach to helping others.",
    "I remember people's personal struggles and check on them.",

    // Administration (Questions 31-40)
    "I enjoy organizing events and making sure details are covered.",
    "I am good at creating systems that help things run smoothly.",
    "I like to make lists and check things off as they are completed.",
    "I am comfortable managing budgets and keeping track of expenses.",
    "I enjoy coordinating schedules and logistics for others.",
    "I am detail-oriented and notice when things are out of place.",
    "I like to plan ahead and prepare for potential problems.",
    "I am good at keeping records and maintaining files.",
    "I enjoy creating order out of chaos.",
    "I am efficient at managing time and resources.",

    // Evangelism (Questions 41-50)
    "I enjoy sharing my faith with people who don't know Jesus.",
    "I look for opportunities to tell others about God's love.",
    "I am comfortable talking to strangers about spiritual matters.",
    "I feel burdened for people who don't have a relationship with God.",
    "I enjoy inviting people to church or Christian events.",
    "I can easily relate to people from different backgrounds.",
    "I am not embarrassed to be identified as a Christian.",
    "I enjoy reading books about how to share my faith effectively.",
    "I get excited when I hear about people coming to faith.",
    "I am persistent but respectful when sharing the gospel.",

    // Service/Helps (Questions 51-60)
    "I enjoy doing practical tasks that help others.",
    "I am happy to work behind the scenes without recognition.",
    "I notice when things need to be done and am willing to do them.",
    "I find joy in meeting the physical needs of others.",
    "I am good with my hands and enjoy practical projects.",
    "I am willing to do jobs that others might consider unimportant.",
    "I enjoy setting up for events and cleaning up afterwards.",
    "I like to help in ways that free others to use their gifts.",
    "I am dependable when people ask for my help.",
    "I feel fulfilled when I can make someone's day easier.",

    // Encouragement/Exhortation (Questions 61-70)
    "I enjoy motivating others to grow in their faith.",
    "I can see potential in people and help them develop it.",
    "I am good at giving advice that helps people make positive changes.",
    "I enjoy mentoring and discipling other believers.",
    "I can help people see solutions to their problems.",
    "I am optimistic and help others see the bright side of situations.",
    "I enjoy coaching others to reach their goals.",
    "I am comfortable challenging people to take the next step.",
    "I can help people apply biblical principles to their daily lives.",
    "I enjoy seeing others succeed and reach their potential.",

    // Giving (Questions 71-80)
    "I enjoy giving generously to support God's work.",
    "I look for opportunities to meet financial needs I become aware of.",
    "I am careful with money so I can give more to others.",
    "I get more joy from giving than from receiving.",
    "I prefer to give anonymously without recognition.",
    "I research organizations to make sure my gifts are used wisely.",
    "I am willing to sacrifice personal comforts to give more.",
    "I feel led to give to specific needs or ministries.",
    "I encourage others to be generous with their resources.",
    "I see my possessions as belonging to God, not to me.",

    // Hospitality (Questions 81-90)
    "I enjoy having people in my home.",
    "I like to make visitors feel welcome and comfortable.",
    "I am good at creating a warm, inviting atmosphere.",
    "I enjoy cooking for others and serving meals.",
    "I notice when someone is alone and try to include them.",
    "I like to connect people with others who have similar interests.",
    "I am comfortable entertaining people I don't know well.",
    "I enjoy planning social gatherings for my friends.",
    "I like to make sure everyone feels included in group activities.",
    "I am naturally hospitable and enjoy serving others.",

    // Faith (Questions 91-100)
    "I believe God can do miraculous things in response to prayer.",
    "I am willing to step out in faith when others hesitate.",
    "I trust God to provide even when circumstances look impossible.",
    "I enjoy praying for big, seemingly impossible requests.",
    "I encourage others to trust God in difficult situations.",
    "I am willing to take risks when I believe God is leading.",
    "I have seen God answer prayers in remarkable ways.",
    "I believe God's promises even when I can't see how they'll be fulfilled.",
    "I am not easily discouraged by setbacks or obstacles.",
    "I inspire others to have greater faith in God's power.",

    // Wisdom (Questions 101-110)
    "People often come to me for advice about important decisions.",
    "I can usually see the best course of action in complex situations.",
    "I am good at discerning people's true motives.",
    "I can often see the long-term consequences of decisions.",
    "I enjoy helping people think through difficult problems.",
    "I have insight into how biblical principles apply to modern situations.",
    "I can usually tell when someone is not being completely honest.",
    "I am good at mediating conflicts between people.",
    "I can see connections between seemingly unrelated things.",
    "I often have a sense of what God wants in a particular situation.",

    // Intercession/Prayer (Questions 111-120)
    "I enjoy spending extended time in prayer.",
    "I often feel led to pray for specific people or situations.",
    "I enjoy praying with others more than praying alone.",
    "I keep prayer lists and pray for people regularly.",
    "I feel called to pray for church leaders and ministries.",
    "I enjoy participating in prayer meetings and prayer groups.",
    "I often wake up with someone on my heart to pray for.",
    "I believe prayer is one of the most important ministries.",
    "I enjoy learning about different methods and types of prayer.",
    "I have seen God work in powerful ways through prayer."
  ];

  const [responses, setResponses] = useState<number[]>(new Array(120).fill(0)); // 0 = not answered, 1-5 = scale responses
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const totalQuestions = 120;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleResponse = (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete assessment
      onComplete({ responses });
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const isQuestionAnswered = () => {
    return responses[currentQuestionIndex] > 0;
  };

  const getGiftCategory = (questionIndex: number) => {
    if (questionIndex < 10) return "Leadership";
    if (questionIndex < 20) return "Teaching";
    if (questionIndex < 30) return "Mercy";
    if (questionIndex < 40) return "Administration";
    if (questionIndex < 50) return "Evangelism";
    if (questionIndex < 60) return "Service/Helps";
    if (questionIndex < 70) return "Encouragement";
    if (questionIndex < 80) return "Giving";
    if (questionIndex < 90) return "Hospitality";
    if (questionIndex < 100) return "Faith";
    if (questionIndex < 110) return "Wisdom";
    return "Prayer/Intercession";
  };

  const renderQuestion = () => {
    const currentQuestion = spiritualGiftsQuestions[currentQuestionIndex];
    const currentGiftCategory = getGiftCategory(currentQuestionIndex);
    
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            {currentGiftCategory} • Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentQuestion}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            How accurately does this statement describe you?
          </p>
        </div>
        
        <RadioGroup 
          value={responses[currentQuestionIndex]?.toString() || ''} 
          onValueChange={(value) => handleResponse(currentQuestionIndex, parseInt(value))}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RadioGroupItem value="1" id="strongly_disagree" />
              <Label htmlFor="strongly_disagree" className="cursor-pointer flex-1">
                <div className="font-medium text-red-700 dark:text-red-400">Strongly Disagree</div>
                <div className="text-sm text-gray-500">This does not describe me at all</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RadioGroupItem value="2" id="disagree" />
              <Label htmlFor="disagree" className="cursor-pointer flex-1">
                <div className="font-medium text-orange-700 dark:text-orange-400">Disagree</div>
                <div className="text-sm text-gray-500">This describes me a little</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RadioGroupItem value="3" id="neutral" />
              <Label htmlFor="neutral" className="cursor-pointer flex-1">
                <div className="font-medium text-gray-700 dark:text-gray-400">Neutral</div>
                <div className="text-sm text-gray-500">This somewhat describes me</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RadioGroupItem value="4" id="agree" />
              <Label htmlFor="agree" className="cursor-pointer flex-1">
                <div className="font-medium text-blue-700 dark:text-blue-400">Agree</div>
                <div className="text-sm text-gray-500">This describes me well</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <RadioGroupItem value="5" id="strongly_agree" />
              <Label htmlFor="strongly_agree" className="cursor-pointer flex-1">
                <div className="font-medium text-green-700 dark:text-green-400">Strongly Agree</div>
                <div className="text-sm text-gray-500">This describes me completely</div>
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">Comprehensive Spiritual Assessment</CardTitle>
              {isRoleMandatory && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Required for Church Leadership roles
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {currentQuestionIndex + 1} of {totalQuestions}
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <div className="mt-3 text-xs text-muted-foreground text-center">
            120 questions • Approximately 20-25 minutes
          </div>
        </CardHeader>
        
        <CardContent>
          {renderQuestion()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevQuestion}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentQuestionIndex === 0 ? 'Back' : 'Previous'}
            </Button>
            
            <Button
              onClick={nextQuestion}
              disabled={!isQuestionAnswered()}
              className="flex items-center gap-2"
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Complete Assessment' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}