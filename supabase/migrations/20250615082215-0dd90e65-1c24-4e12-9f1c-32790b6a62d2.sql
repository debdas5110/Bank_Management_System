
-- Update the handle_new_user function to properly handle signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_phone TEXT;
  account_num TEXT;
  user_first_name TEXT;
  user_last_name TEXT;
  user_address TEXT;
  user_dob DATE;
BEGIN
  -- Extract data from user metadata (these will be passed during signup)
  user_phone := NEW.raw_user_meta_data ->> 'phone';
  user_first_name := NEW.raw_user_meta_data ->> 'first_name';
  user_last_name := NEW.raw_user_meta_data ->> 'last_name';
  user_address := NEW.raw_user_meta_data ->> 'address';
  
  -- Handle date of birth conversion
  BEGIN
    user_dob := (NEW.raw_user_meta_data ->> 'date_of_birth')::DATE;
  EXCEPTION
    WHEN OTHERS THEN
      user_dob := NULL;
  END;
  
  -- Generate account number (phone + last 4 digits of IFSC)
  account_num := public.generate_account_number(user_phone);
  
  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    phone, 
    email,
    date_of_birth,
    address
  ) VALUES (
    NEW.id,
    COALESCE(user_first_name, ''),
    COALESCE(user_last_name, ''),
    COALESCE(user_phone, ''),
    NEW.email,
    user_dob,
    user_address
  );
  
  -- Create bank account with savings type
  INSERT INTO public.accounts (
    user_id,
    account_number,
    account_type,
    balance,
    ifsc_code
  ) VALUES (
    NEW.id,
    account_num,
    'savings',
    0.00,
    'DEB0002580'
  );
  
  RETURN NEW;
END;
$$;
