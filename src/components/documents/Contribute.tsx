import { useState } from "react";
import { Upload, MessageCircle, Users, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";    

export function ContributeDocuments() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r  dark:bg-[#0F0F0F] border rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 flex-shrink-0">
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Help Grow Our Community! 📚
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Share your study materials and help fellow students access resources for their courses.
            </p>
            
            {!isExpanded ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
              >
                Learn How to Contribute
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    How to Contribute:
                  </h4>
                  <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">1</span>
                      <span>Join our WhatsApp organization group</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">2</span>
                      <span>Send your materials with the <strong>course name</strong> and <strong>course code</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full w-5 h-5 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">3</span>
                      <span>Help other students access the resources they need!</span>
                    </li>
                  </ol>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="w-3 h-3" />
                  <span>Every contribution helps build a stronger learning community</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white border-0"
                    onClick={() => {
                      // This would open WhatsApp - you can replace with actual WhatsApp group link
                      window.open('https://chat.whatsapp.com/LLycZyCPoY5JZVu0QqR1Nv', '_blank');
                    }}
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Join WhatsApp Group
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Collapse
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 ml-2"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}