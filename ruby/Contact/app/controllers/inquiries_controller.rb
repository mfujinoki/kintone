
=begin
RoR Controller Sample
Copyright (c) 2018 Cybozu
Licensed under the MIT License
=end

require 'net::http'
class InquiriesController < ApplicationController

  def new
  end

  def create
    @inquiry = Inquiry.new(inquiry_params)
    if @inquiry.save
      # Use token authentication
      api = Kintone::Api.new("devxorudc.cybozu.com", "lnsKlO3DBNlE6Bq6s1LEkeamm2ylAmViY3kcrozx")
      app = 69

      # Record register(single record)
      # Use Hash
      record = {"Customer" => {"value" => inquiry_params[:company_name]},
                "Customer_name" => {"value" => inquiry_params[:client_name]},
                "QType" => {"value" => inquiry_params[:contact_type]},
                "Detail" => {"value" => inquiry_params[:details]}
                }
      api.record.register(app, record)
      redirect_to root_path
    else
      render 'new'
    end
  end
  
  private
    def inquiry_params
      params.require(:inquiry).permit(:company_name, :client_name, :contact_type, :details)
    end
end
