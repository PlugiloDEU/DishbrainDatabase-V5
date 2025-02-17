import json
import os

def create_individual_json(person, output_dir):
    """
    Generates a new JSON file for each person with the specified structure.
    """

    # Extracting relevant skills and job titles
    skills = person.get('skills', [])
    job_title = person.get('jobTitle') or person.get('occupation', '')
    
    # Determining primary expertise based on skills and job title
    primary_expertise = []
    if any(skill in ["Artificial Intelligence", "Machine Learning", "NLP"] for skill in skills) or \
       any(keyword in job_title for keyword in ["AI", "Machine Learning", "NLP"]):
        primary_expertise.append("Artificial Intelligence")
    if any(skill in ["Data Science", "Big Data"] for skill in skills) or \
       any(keyword in job_title for keyword in ["Data Science", "Big Data"]):
        primary_expertise.append("Data Science")

    # Creating the new JSON structure
    new_json = {
        "id": f"exp{person.get('id', '')}",
        "personalInfo": {
            "title": None,
            "firstName": person.get('firstName', ''),
            "lastName": person.get('lastName', ''),
            "fullName": f"{person.get('firstName', '')} {person.get('lastName', '')}",
            "image": person.get('coverImage') or person.get('image') or person.get('pictureUrl'),
            "email": None,
            "phone": None,
            "languages": [lang.get('name', '') for lang in person.get('languages', [])],
            "allData": person
        },
        "institution": {
            "name": person.get('companyName', ''),
            "position": job_title,
            "department": None,
            "website": None
        },
        "expertise": {
            "primary": primary_expertise,  # Populating primary expertise
            "secondary": [],
            "industries": []
        },
        "academicMetrics": {
            "publications": {
                "total": None,
                "sources": {
                    "googleScholar": None,
                    "scopus": None
                }
            }
        },
        "currentRole": {
            "title": job_title,
            "organization": person.get('companyName', ''),
            "focus": None
        },
        "profiles": {
            "linkedin": f"https://www.linkedin.com/in/{person.get('publicIdentifier', '')}/",
            "company": person.get('companyLinkedinUrl', '')
        },
        "tags": [],
        "source": "LinkedIn",
        "experience": person.get('positions', []),
        "education": person.get('educations', []),
        "certifications": person.get('certifications', []),
        "skills": skills,
        "lastEnriched": "2025-02-17"
    }

    # Attempting to extract industries if available
    positions = person.get('positions', [])
    if positions:
        first_position = positions[0]
        company = first_position.get('company', {})
        industries = company.get('industries', [])
        new_json['expertise']['industries'] = industries

    # Creating the output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Writing the JSON data to the file
    filename = f"{person.get('firstName', 'unknown')}_{person.get('lastName', 'unknown')}.json"
    filepath = os.path.join(output_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(new_json, f, indent=4, ensure_ascii=False)
# Loading the dataset
with open('dataset_linkedin-profile-scraper_2025-02-17_00-54-12-500.json', 'r', encoding='utf-8') as f:
    dataset = json.load(f)

# Creating a directory to store the individual JSON files
output_directory = 'individual_jsons'

# Generating individual JSON files for each person in the dataset
for person in dataset:
    create_individual_json(person, output_directory)
