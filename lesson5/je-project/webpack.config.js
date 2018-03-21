const path = require("path");

module.exports = {
	  entry: ["./src/index.js"],
	  output: {
		      path: path.resolve(__dirname, "dist"),
		      filename: "main.js"
		    },
	  mode: process.env.NODE_ENV || 'development',
	  module: {
		      rules: [
			            {
					            test: /\.js$/,
					            exclude: /node_modules/,
					            use: {
							              loader: "babel-loader"
							            }
					          }
			          ]
		    }
};
