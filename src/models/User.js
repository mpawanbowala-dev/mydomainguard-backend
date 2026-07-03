const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: true // Ensure password is selected by default, but we can manage selection in controllers
    },
    
    // --- අලුතින් එකතු කළ කොටස: Subscription සහ Paddle විස්තර ---
    plan: {
      type: String,
      enum: ['free', 'pro', 'unlimited'],
      default: 'free' // අලුතින් එන හැමෝම මුලින්ම Free plan එකට වැටේ
    },
    paddleCustomerId: {
      type: String,
      default: null // සල්ලි ගෙව්වට පස්සේ Paddle එකෙන් දෙන ID එක
    },
    subscriptionId: {
      type: String,
      default: null // අදාළ පැකේජයේ ID එක
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'none'],
      default: 'none'
    }
  },
  {
    timestamps: true // Automatically create createdAt and updatedAt timestamps
  }
);

/**
 * Pre-save Middleware: Encrypt password using bcryptjs before saving user document.
 */
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: Compare entered password with the hashed password in database.
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);