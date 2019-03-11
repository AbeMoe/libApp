//Name: call_code 
//Purpose: automatically takes a code and parses it 
//         for ease of use in queries.
class call_code {
    constructor(code) {
        this.full = code;
        this.let1 = this.num1 =
            this.let2 = this.num2 =
            this.year = "";
        var i = 0;
        while (/[a-zA-Z]/.test(code[i]) && code[i] != undefined) {
            this.let1 += code[i].toUpperCase();
            i++;
        }
        while (/[0-9]/.test(code[i]) && code[i] != undefined) {
            this.num1 += code[i]
            i++;
            if (code[i] == '.' && /[0-9]/.test(code[i + 1])) {
                this.num1 += code[i];
                i++;
            }
        }
        if (code[i] == '.')
            i++;
        while (/[a-zA-Z]/.test(code[i]) && code[i] != undefined) {
            this.let2 += code[i].toUpperCase();
            i++;
        }
        while (/[0-9]/.test(code[i]) && code[i] != undefined) {
            this.num2 += code[i]
            i++;
        }

    }

}

class book_range {
    constructor(rectangle, lower, upper) {
        this.rectangle = rectangle
        if (typeof lower == "string")
            this.lower = new call_code(lower);
        else if ( lower instanceof call_code)
            this.lower = lower;
        if (typeof upper == "string")
            this.upper = new call_code(upper);
        else if (upper instanceof call_code)
            this.upper = upper;
    }
}

/*Depreciated, because it was hard coding and ultimately better practices prevailed.
function betweenCodes(lower, upper, input_code)
{ 
    let1Bool = lower.let1 < input_code.let1 && upper.let1 > input_code.let1;
    num1Bool = lower.num1 <= input_code.num1 && upper.num1 >= input_code.num1;
    let2Bool = lower.let2 <= input_code.let2 && upper.let2 >= input_code.let2;
    num2Bool = lower.num2 <= input_code.num2 && upper.num2 >= input_code.num2;
    if (let1Bool)
        return true;
    else if (let1Bool && num1Bool)
        return true;
    else if (let1Bool && num1Bool  && let2Bool)
        return true;
    else if (let1Bool && num1Bool && let2Bool && num2Bool)
        return true;
    else 
        return false;

}*/

function betweenCodes(lower, upper, input_code) {
    for (key of Object.keys(input_code))
    {
        if (lower[key] < input_code[key] && upper[key] > input_code[key])
            return true;
        else if (lower[key] != input_code[key] && upper[key] != input_code[key])
            return false;
    }

}


module.exports =
{
    findRanges: function (code, ranges)
    {
        callCode = new call_code(code);
        for (range of ranges)
        {

            if (betweenCodes(range.lower, range.upper, callCode))
            {
                return range;
            }

        }
        return undefined
    }
    }
