class FeedbacksController < ApplicationController
    def new
    end
  
    def create
      @feedback = Feedback.new(feedback_params)
      if @feedback.save
        redirect_to root_path
      else
        render 'new'
      end
    end
    
    private
      def feedback_params
        params.require(:feedback).permit(:received_via, :category, :tenant_name, :opinion)
      end
end
