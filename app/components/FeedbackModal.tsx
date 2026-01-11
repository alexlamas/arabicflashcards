"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle } from "@phosphor-icons/react";
import { toast } from "@/hooks/use-toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          pageUrl: window.location.href,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setMessage("");
        setIsSubmitted(false);
      }, 1500);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to submit feedback",
        description: "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setMessage("");
    setIsSubmitted(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" weight="fill" />
            <p className="text-lg font-medium">Thank you!</p>
            <p className="text-sm text-muted-foreground">Your feedback has been received.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="What's on your mind? Bug reports, feature requests, or just say hi..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
