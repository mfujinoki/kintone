class CreateInquiries < ActiveRecord::Migration[5.1]
  def change
    create_table :inquiries do |t|
      t.string :company_name
      t.string :client_name
      t.string :contact_type
      t.text :details

      t.timestamps
    end
  end
end
