import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://semybkykisazqrwvewyw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlbXlia3lraXNhenFyd3Zld3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyODQ2MzcsImV4cCI6MjEwNDg2MDYzN30.W2WwZB9-JrncT-3HEmQSU7Gn_cwRDwNP9IGobYimVfM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
