# Make a parent class
class Person
  # with an instance method
  def greet
    puts "Hello"
  end
  # and a class method.
  def self.create
    self.new
  end
end

# Create a subclass
class Dave < Person
end
# and test it.
puts Dave.create
puts Dave.new
Dave.create.greet
