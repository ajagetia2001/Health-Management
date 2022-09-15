var sgMail=require('@sendgrid/mail')

var sendgridAPIkey='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'

sgMail.setApiKey(sendgridAPIkey)

var sendWelcomeEmail=( email, name)=>{
    sgMail.send({
        to:email,
        from:'lit2019033@iiitl.ac.in',
        subject:'Welcome',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

var sendCancellationEmail=(email, name)=>{
    sgMail.send({
        to:email,
        from:'lit2019033@iiitl.ac.in',
        subject:'Cancellation',
        text: `Thanks for using to the app, ${name}. Let me know how was ur experience.`
    })
}

var sendReminderEmail=( email, str)=>{
    sgMail.send({
        to:email,
        from:'lit2019033@iiitl.ac.in',
        subject:'Reminder',
        text: `please take, ${str}. Wish u a healthy life.`
    })
}

var sendOverEmail=( email, name)=>{
    sgMail.send({
        to:email,
        from:'lit2019033@iiitl.ac.in',
        subject:'Reminder',
        text: `Your Medicine, ${name} is over.`
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancellationEmail,
    sendReminderEmail,
    sendOverEmail
}




