const mongoose = require("mongoose");
const Joi = require("joi");
var validateEmail = function (email) {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email);
};

const userSchema = new mongoose.Schema(
	{
		first_name: {
			type: String,
		},

		last_name: {
			type: String,
		},

		email: {
			type: String,
			trim: true,
			lowercase: true,
			unique: true,
			//validate: [validateEmail, 'Please fill a valid email address'],
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please fill a valid email address",
			],
		},
		password: {
			type: String,
		},
		user_role_id: {
			type: Number,
			required: true,
		},
		is_active: {
			type: Boolean,
			default: 1,
		},
		is_deleted: {
			type: Boolean,
			default: 0,
		},
		forgot_password_validate_string: {
			type: String,
			default: null,
			required:false
		},
	},
	{
		timestamps: true,
	}
);

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();
	delete userObject.password;
	return userObject;
};

const User = mongoose.model("user", userSchema);

function validateAll(api, data) {
	let resMsg = "";
	const firstNameSchema = Joi.object({
		first_name: Joi.string().required().messages({
			"string.empty": "Please enter first name",
			"any.required": "Please enter first name",
		}),
	}).options({ abortEarly: false });

	const lastNameSchema = Joi.object({
		last_name: Joi.string().required().messages({
			"string.empty": "Please enter last name",
			"any.required": "Please enter last name",
		}),
	}).options({ abortEarly: false });

	const emailSchema = Joi.object({
		email: Joi.string().required().email().messages({
			"string.empty": "Please enter email",
			"string.email": "Please enter valid email",
			"any.required": "Please enter email",
		}),
	}).options({ abortEarly: false });

	const passwordSchema = Joi.object({
		password: Joi.string().min(6).max(255).required().messages({
			"string.empty": "Please enter password",
			"string.min": "Password should be at least 6 characters",
			"string.max": "Password should be at most 255 characters",
			"any.required": "Please enter password",
		}),
	}).options({ abortEarly: false });
	
	if (api === "signup") {
		const { error } = firstNameSchema.validate({ first_name: data.first_name });
		if (error) {
			error.details.forEach((element) => {
				resMsg = resMsg + "  " + element.message;
			});
		}
	}

	if (api === "signup") {
		const { error } = lastNameSchema.validate({ last_name: data.last_name });
		if (error) {
			error.details.forEach((element) => {
				resMsg = resMsg + "  " + element.message;
			});
		}
	}

	if (api === "login" || api === "signup" || api === "updateProfile" || api === 'forgotpassword') {
		const { error } = emailSchema.validate({ email: data.email });
		if (error) {
			error.details.forEach((element) => {
				resMsg = resMsg + "  " + element.message;
			});
		}
	}

	if (api === "login" || api === "signup" || api === "changePassword") {
		const { error } = passwordSchema.validate({ password: data.password });
		if (error) {
			error.details.forEach((element) => {
				resMsg = resMsg + "  " + element.message;
			});
		}
	}
	return resMsg;
}
function resetPasswordValidate(user) {
	const schema = Joi.object({
		forgot_password_validate_string: Joi.string().min(6).max(255).required().messages({
			'string.empty': `Validate string is required.`,
			'any.required': `Validate string is required.`
		}),
		new_password: Joi.string().min(6).max(255).required().messages({
			'string.empty': `Please enter new password.`,
			'string.min': `Password should have at least 6 characters.`,
			'string.max': `Password should have at most 255 characters.`,
			'any.required': `New Password field is required.`
		}),
		confirm_password: Joi.any().required().equal(Joi.ref('new_password')).empty('')
			.label('Confirm password')
			.options({
				errors: {
					wrap: {
						label: ' '
					}
				},
				messages: { 'any.only': '{{#label}} does not match' }
			})
	}).options({ abortEarly: false });
	
	const validation = schema.validate(user);
	let resMsg = ''
	
	if (validation.error) {
		validation.error.details.forEach((element) => {
			resMsg = resMsg + "  " + element.message;
		});
	}
	return resMsg;
}
function changePasswordValidate(user) {
	const schema = Joi.object({
		old_password: Joi.string().min(6).max(255).required().messages({
			'string.empty': `Please enter old password.`,
			'string.min': `Password should have at least 6 characters.`,
			'string.max': `Password should have at most 255 characters.`,
			'any.required': `Old Password field is required.`
		}),
		new_password: Joi.string().min(6).max(255).required().messages({
			'string.empty': `Please enter new password.`,
			'string.min': `Password should have at least 6 characters.`,
			'string.max': `Password should have at most 255 characters.`,
			'any.required': `New Password field is required.`
		}),
		confirm_password: Joi.any().required().equal(Joi.ref('new_password')).empty('')
			.label('Confirm password')
			.options({
				errors: {
					wrap: {
						label: ' '
					}
				},
				messages: { 'any.only': '{{#label}} does not match' }
			})
	}).options({ abortEarly: false });
	
	const validation = schema.validate(user);
	let resMsg = ''
	
	if (validation.error) {
		validation.error.details.forEach((element) => {
			resMsg = resMsg + "  " + element.message;
		});
	}
	return resMsg;
}
module.exports = { User, validateAll, resetPasswordValidate, changePasswordValidate };
