Rails.application.routes.draw do
  get '/feedbacks', to: 'feedbacks#new'
  post '/feedbacks', to: 'feedbacks#create'
  resources :feedbacks

  root 'feedbacks#new'
end
