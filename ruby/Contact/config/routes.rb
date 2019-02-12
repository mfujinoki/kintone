Rails.application.routes.draw do
  get '/inquiries', to: 'inquiries#new'
  post '/inquiries', to: 'inquiries#create'
  resources :inquiries

  root 'inquiries#new'
end
