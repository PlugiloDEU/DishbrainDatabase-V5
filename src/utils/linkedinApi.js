import { Linkedin } from 'linkedin-api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const LINKEDIN_EMAIL = 'patrick.blanks82@gmail.com';
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD;

class LinkedInApiWrapper {
  constructor() {
    if (!LINKEDIN_PASSWORD) {
      throw new Error('LinkedIn password not found in environment variables. Please check your .env file.');
    }
    
    try {
      this.api = new Linkedin(LINKEDIN_EMAIL, LINKEDIN_PASSWORD);
    } catch (error) {
      console.error('Failed to initialize LinkedIn API:', error);
      throw error;
    }
  }

  async getProfile(publicId) {
    try {
      return await this.api.get_profile(publicId);
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw error;
    }
  }

  async getProfileContactInfo(publicId) {
    try {
      return await this.api.get_profile_contact_info(publicId);
    } catch (error) {
      console.error('Error fetching LinkedIn contact info:', error);
      throw error;
    }
  }

  async getProfileExperiences(urnId) {
    try {
      return await this.api.get_profile_experiences(urnId);
    } catch (error) {
      console.error('Error fetching LinkedIn experiences:', error);
      throw error;
    }
  }

  async getProfileSkills(publicId) {
    try {
      return await this.api.get_profile_skills(publicId);
    } catch (error) {
      console.error('Error fetching LinkedIn skills:', error);
      throw error;
    }
  }

  async searchPeople(params) {
    try {
      return await this.api.search_people({
        keywords: params.keywords,
        currentCompany: params.companies,
        regions: params.regions,
        industries: params.industries,
        schools: params.schools,
        networkDepths: params.networkDepths,
        includePrivateProfiles: params.includePrivateProfiles,
      });
    } catch (error) {
      console.error('Error searching LinkedIn profiles:', error);
      throw error;
    }
  }

  async getCompany(publicId) {
    try {
      return await this.api.get_company(publicId);
    } catch (error) {
      console.error('Error fetching LinkedIn company:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const linkedInApi = new LinkedInApiWrapper();
export default linkedInApi; 