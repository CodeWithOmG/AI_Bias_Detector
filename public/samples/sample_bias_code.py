def calculate_bonus(base_salary, gender, experience):
    # Potential bias: base bonus depends on gender
    if gender == 'male':
        bonus = base_salary * 0.15
    else:
        bonus = base_salary * 0.10
    
    # Adding experience bonus
    bonus += experience * 500
    
    return bonus

def approve_loan(credit_score, age, race):
    # Potential bias: age-based thresholding that might be discriminatory
    if age < 25:
        threshold = 750
    else:
        threshold = 650
        
    # Potential bias: race-based decision (extremely unethical and biased)
    if race == 'minority':
        threshold += 50
        
    if credit_score >= threshold:
        return True
    return False

def get_hiring_priority(years_exp, marital_status):
    # Potential bias: marital status should not affect hiring priority
    if marital_status == 'single':
        priority = 'High'
    else:
        priority = 'Medium'
        
    if years_exp > 10:
        priority = 'Elite'
        
    return priority
