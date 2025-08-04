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
  
  // 120 spiritual gifts assessment questions with redundancy and validity checks
  // Each gift has 10 questions with some redundant phrasing and inverse statements
  const spiritualGiftsQuestions = [
    // Leadership (Questions 1-10) - Mix of positive and inverse statements
    "I enjoy organizing people and resources to accomplish goals.",
    "Others naturally look to me for direction during group activities.", 
    "I prefer to follow rather than lead in group situations.", // INVERSE
    "I can see the big picture when others get caught up in details.",
    "People often ask me to take charge of projects or activities.",
    "I avoid taking responsibility when things go wrong.", // INVERSE
    "I enjoy motivating others to reach their potential.",
    "I feel uncomfortable when others look to me for leadership.", // INVERSE
    "I am comfortable with the authority that comes with leadership.",
    "I have a vision for how things could be improved in my community.",

    // Teaching (Questions 11-20)
    "I enjoy explaining biblical concepts to others.",
    "People tell me I make complex ideas easy to understand.",
    "I get frustrated when I have to explain things to others.", // INVERSE
    "I enjoy preparing lessons or presentations.",
    "I get excited when I see others learn something new.",
    "I avoid speaking in front of groups whenever possible.", // INVERSE
    "I enjoy answering questions about faith and the Bible.",
    "I find it draining to help others understand new concepts.", // INVERSE
    "I feel fulfilled when I help others grow in their understanding.",
    "I am patient with people who learn at different speeds.",

    // Mercy (Questions 21-30)
    "I am deeply moved by the suffering of others.",
    "I am drawn to help people who are hurting emotionally.",
    "I tend to avoid people who are going through difficult times.", // INVERSE
    "I prefer to help people one-on-one rather than in groups.",
    "I am a good listener when people need to talk.",
    "Other people's emotional problems don't really affect me.", // INVERSE
    "I am patient with people who are struggling.",
    "I feel called to comfort those who are grieving.",
    "I find it uncomfortable when people share their problems with me.", // INVERSE
    "I remember people's personal struggles and check on them.",

    // Administration (Questions 31-40)
    "I enjoy organizing events and making sure details are covered.",
    "I am good at creating systems that help things run smoothly.",
    "I prefer spontaneity over detailed planning.", // INVERSE
    "I am comfortable managing budgets and keeping track of expenses.",
    "I enjoy coordinating schedules and logistics for others.",
    "Details and organization are not important to me.", // INVERSE
    "I like to plan ahead and prepare for potential problems.",
    "I am good at keeping records and maintaining files.",
    "I find administrative tasks boring and tedious.", // INVERSE
    "I am efficient at managing time and resources.",

    // Evangelism (Questions 41-50)
    "I enjoy sharing my faith with people who don't know Jesus.",
    "I look for opportunities to tell others about God's love.",
    "I feel uncomfortable discussing spiritual matters with non-believers.", // INVERSE
    "I feel burdened for people who don't have a relationship with God.",
    "I enjoy inviting people to church or Christian events.",
    "I prefer to keep my faith private rather than share it.", // INVERSE
    "I can easily relate to people from different backgrounds.",
    "I enjoy reading books about how to share my faith effectively.",
    "I worry about offending people if I talk about Jesus.", // INVERSE
    "I get excited when I hear about people coming to faith.",

    // Service/Helps (Questions 51-60)
    "I enjoy doing practical tasks that help others.",
    "I am happy to work behind the scenes without recognition.",
    "I prefer tasks that give me public recognition and visibility.", // INVERSE
    "I notice when things need to be done and am willing to do them.",
    "I am good with my hands and enjoy practical projects.",
    "I avoid manual or physical work whenever possible.", // INVERSE
    "I enjoy setting up for events and cleaning up afterwards.",
    "I like to help in ways that free others to use their gifts.",
    "I expect others to handle practical tasks while I focus on more important things.", // INVERSE
    "I feel fulfilled when I can make someone's day easier.",

    // Encouragement/Exhortation (Questions 61-70)
    "I enjoy motivating others to grow in their faith.",
    "I can see potential in people and help them develop it.",
    "I find it difficult to stay positive when helping others through challenges.", // INVERSE
    "I enjoy mentoring and discipling other believers.",
    "I can help people see solutions to their problems.",
    "I tend to focus on people's weaknesses rather than their strengths.", // INVERSE
    "I enjoy coaching others to reach their goals.",
    "I am comfortable challenging people to take the next step.",
    "I avoid confronting people even when they need encouragement to grow.", // INVERSE
    "I enjoy seeing others succeed and reach their potential.",

    // Giving (Questions 71-80)
    "I enjoy giving generously to support God's work.",
    "I look for opportunities to meet financial needs I become aware of.",
    "I believe I should hold onto my money for my own security first.", // INVERSE
    "I get more joy from giving than from receiving.",
    "I prefer to give anonymously without recognition.",
    "I only give when I know I'll receive public acknowledgment.", // INVERSE
    "I am willing to sacrifice personal comforts to give more.",
    "I feel led to give to specific needs or ministries.",
    "I find it difficult to part with my money, even for good causes.", // INVERSE
    "I see my possessions as belonging to God, not to me.",

    // Hospitality (Questions 81-90)
    "I enjoy having people in my home.",
    "I like to make visitors feel welcome and comfortable.",
    "I prefer to keep my personal space private and not entertain guests.", // INVERSE
    "I am good at creating a warm, inviting atmosphere.",
    "I notice when someone is alone and try to include them.",
    "I tend to stick with my close friends rather than welcoming newcomers.", // INVERSE
    "I am comfortable entertaining people I don't know well.",
    "I enjoy planning social gatherings for my friends.",
    "I find hosting events stressful and prefer to attend rather than host.", // INVERSE
    "I am naturally hospitable and enjoy serving others.",

    // Faith (Questions 91-100)
    "I believe God can do miraculous things in response to prayer.",
    "I am willing to step out in faith when others hesitate.",
    "I prefer to see concrete proof before I trust God for big things.", // INVERSE
    "I enjoy praying for big, seemingly impossible requests.",
    "I encourage others to trust God in difficult situations.",
    "I tend to worry and doubt when facing uncertain situations.", // INVERSE
    "I have seen God answer prayers in remarkable ways.",
    "I believe God's promises even when I can't see how they'll be fulfilled.",
    "I need to have backup plans because I can't fully rely on God's provision.", // INVERSE
    "I inspire others to have greater faith in God's power.",

    // Wisdom (Questions 101-110)
    "People often come to me for advice about important decisions.",
    "I can usually see the best course of action in complex situations.",
    "I prefer to avoid giving advice because I might be wrong.", // INVERSE
    "I can often see the long-term consequences of decisions.",
    "I enjoy helping people think through difficult problems.",
    "I find it overwhelming when people ask me for guidance on important matters.", // INVERSE
    "I have insight into how biblical principles apply to modern situations.",
    "I am good at mediating conflicts between people.",
    "I try to stay out of other people's disputes and problems.", // INVERSE
    "I often have a sense of what God wants in a particular situation.",

    // Intercession/Prayer (Questions 111-120)
    "I enjoy spending extended time in prayer.",
    "I often feel led to pray for specific people or situations.",
    "I find it difficult to concentrate during long prayer times.", // INVERSE
    "I keep prayer lists and pray for people regularly.",
    "I feel called to pray for church leaders and ministries.",
    "I prefer brief prayers rather than extended intercession.", // INVERSE
    "I often wake up with someone on my heart to pray for.",
    "I believe prayer is one of the most important ministries.",
    "I find intercessory prayer boring and prefer other forms of ministry.", // INVERSE
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

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentQuestionIndex((currentPage + 1) * questionsPerPage);
    } else {
      onComplete({ responses });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentQuestionIndex((currentPage - 1) * questionsPerPage);
    } else if (onBack) {
      onBack();
    }
  };

  const isPageComplete = () => {
    for (let i = startIndex; i < endIndex; i++) {
      if (responses[i] === 0) { // 0 = not answered
        return false;
      }
    }
    return true;
  };

  // Track which questions are inverse statements for proper scoring
  const inverseQuestions = [2, 5, 7, 12, 15, 17, 22, 25, 28, 32, 35, 38, 42, 45, 48, 52, 55, 58, 62, 65, 68, 72, 75, 78, 82, 85, 88, 92, 95, 98, 102, 105, 108, 112, 115, 118];

  // Mixed categories array created from the shuffled questions
  const giftCategories = [
    "Leadership", "Teaching", "Mercy", "Administration", "Evangelism", "Service", 
    "Encouragement", "Giving", "Hospitality", "Faith", "Wisdom", "Prayer"
  ];

  const getGiftCategory = (questionIndex: number) => {
    // Since questions are now mixed, we cycle through categories
    return giftCategories[questionIndex % giftCategories.length];
  };

  const isInverseQuestion = (questionIndex: number) => {
    return inverseQuestions.includes(questionIndex);
  };

  const questionsPerPage = 5; // 5 questions per page like 30-question format
  const currentPage = Math.floor(currentQuestionIndex / questionsPerPage);
  const totalPages = Math.ceil(totalQuestions / questionsPerPage); // 24 pages total
  const startIndex = currentPage * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions);
  const currentPageQuestions = spiritualGiftsQuestions.slice(startIndex, endIndex);

  const renderQuestionPage = () => {
    return (
      <div className="space-y-6">
        {currentPageQuestions.map((question, index) => {
          const absoluteIndex = startIndex + index;
          const currentGiftCategory = getGiftCategory(absoluteIndex);
          const isInverse = isInverseQuestion(absoluteIndex);
          
          return (
            <div key={absoluteIndex} className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-normal text-gray-900 dark:text-white flex-1 pr-4">
                  {question}
                </h3>
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium whitespace-nowrap">
                  {currentGiftCategory}
                </div>
              </div>
              
              <RadioGroup 
                value={responses[absoluteIndex]?.toString() || ''} 
                onValueChange={(value) => handleResponse(absoluteIndex, parseInt(value))}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-normal">Strongly Disagree</span>
                  
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="relative flex items-center justify-center">
                        <RadioGroupItem 
                          value={value.toString()} 
                          id={`q${absoluteIndex}-option-${value}`}
                          className="w-8 h-8 border-2 border-gray-300 rounded-full hover:border-purple-500 transition-colors data-[state=checked]:border-purple-600 data-[state=checked]:bg-purple-600"
                        />
                        <Label 
                          htmlFor={`q${absoluteIndex}-option-${value}`} 
                          className="absolute inset-0 flex items-center justify-center text-xs text-gray-700 cursor-pointer font-medium data-[state=checked]:text-white"
                        >
                          {value}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <span className="text-xs text-gray-500 font-normal">Strongly Agree</span>
                </div>
              </RadioGroup>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl mb-2">Spiritual Gifts Assessment</CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Discover your God-given spiritual gifts and find your perfect ministry fit (120 questions)
              </p>
              {isRoleMandatory && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  Required for Church Leadership roles
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          <Progress value={progress} className="w-full h-2" />
          
          {renderQuestionPage()}
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </div>
            
            <Button
              onClick={nextPage}
              disabled={!isPageComplete()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {currentPage === totalPages - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}