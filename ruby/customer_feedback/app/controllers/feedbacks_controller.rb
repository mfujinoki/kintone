
require 'oauth2'

class FeedbacksController < ApplicationController
  CLIENT_ID = 'l.1.6yj9tvyxuue0iclewfa3gp3thug4zjrm'
  CLIENT_SECRET = 'em9pph5rzj91duv42v0ry4kkkcothzm4vjd487ykfkxwlaafuwl3e5eiodwsq2dk'
  SCOPE_CODE = 'k:app_record:read'
  APP_ID = 117
  
  # google の認可サーバにリクエスト
  def authorization
      client = OAuth2::Client.new(
          CLIENT_ID,
          CLIENT_SECRET,
          {
              site: 'https://devxorudc.cybozu.com/',
              authorize_url: 'oauth2/authorization',
          }
      )
      redirect_to client.auth_code.authorize_url(
          redirect_uri: 'https://aqueous-shelf-62482.herokuapp.com/feedbacks/callback',
          scope: SCOPE_CODE,
      )
  end

  # パラメータで認可コード（code）を取得し、access_tokenをリクエスト・取得する。
  def callback
      client = OAuth2::Client.new(
          CLIENT_ID,
          CLIENT_SECRET,
          {
          site: 'https://devxorudc.cybozu.com/',
          token_url: 'oauth2/token',
          }
      )
      # 認可コードよりaccess_tokenをリクエスト・取得。
      @@token = client.auth_code.get_token(
          params[:code],
          redirect_uri: 'https://aqueous-shelf-62482.herokuapp.com/feedbacks/callback',
      )
  end  
  
  def new
  end
  
  def create
    @feedback = Feedback.new(feedback_params)
    if @feedback.save
      if (defined?($token)).nil?
        Oauth.authorization
      end

      # Record register(single record)
      # Use Hash
      record = {
        "app": APP_ID,
        "record": {
          "Received_via": {
            "value": feedback_params[:received_via]
          },
          "Category": {
            "value": feedback_params[:category]
          },
          "Tenant_name": {
            "value": feedback_params[:tenant_name]
          },
          "Opinion": {
            "value": feedback_params[:opinion]
          }
        }
      }
      $token.post('https://devxorudc.cybozu.com/k/v1/record.json?app=116', :params => record)
      
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
